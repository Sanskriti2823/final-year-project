import os
from pathlib import Path
from typing import Optional
import pandas as pd
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title="LearnSmart AI Recommendation Service", version="1.0.0")
DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "courses.csv"
catalog = pd.read_csv(DATA_FILE).fillna("")

class CourseInput(BaseModel):
    id: str
    title: str
    description: str = ""
    category: str = ""
    level: str = "beginner"
    tags: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)

class RecommendationRequest(BaseModel):
    interests: list[str] = Field(default_factory=list)
    goals: list[str] = Field(default_factory=list)
    skillLevel: str = "beginner"
    completedIds: list[str] = Field(default_factory=list)
    limit: int = Field(default=6, ge=1, le=20)
    courses: list[CourseInput] = Field(default_factory=list)

def course_text(course: dict) -> str:
    return " ".join([
        str(course.get("title", "")),
        str(course.get("description", "")),
        str(course.get("category", "")),
        str(course.get("level", "")),
        " ".join(course.get("tags", []) or []),
        " ".join(course.get("skills", []) or [])
    ])

@app.get("/health")
def health():
    return {"status": "ok", "service": "learnsmart-ai"}

@app.post("/recommend")
def recommend(payload: RecommendationRequest, x_service_key: Optional[str] = Header(default=None)):
    expected_key = os.getenv("AI_SERVICE_KEY", "")
    if expected_key and x_service_key != expected_key:
        raise HTTPException(status_code=401, detail="Invalid service key")

    # Prefer the actual current MongoDB catalog sent by Express. Fall back to CSV for docs/manual tests.
    if payload.courses:
        courses = [c.model_dump() for c in payload.courses]
    else:
        courses = []
        for i, row in catalog.iterrows():
            courses.append({
                "id": str(i), "title": str(row["title"]),
                "description": str(row["description"]), "category": str(row["category"]),
                "level": str(row["level"]),
                "tags": str(row["tags"]).split(),
                "skills": str(row["skills"]).split()
            })

    if not courses:
        return {"recommendations": []}

    documents = [course_text(c) for c in courses]
    profile = " ".join(payload.interests + payload.goals + [payload.skillLevel])
    vectorizer = TfidfVectorizer(stop_words="english")
    try:
        matrix = vectorizer.fit_transform(documents + [profile])
        similarities = cosine_similarity(matrix[-1], matrix[:-1]).flatten()
    except ValueError:
        similarities = [0.0] * len(courses)

    level_score = {"beginner": 1.0, "intermediate": 0.85, "advanced": 0.7}
    scores = []
    for i, course in enumerate(courses):
        similarity = float(similarities[i])
        course_level = str(course.get("level", "beginner")).lower()
        level_fit = 1.0 if course_level == payload.skillLevel else level_score.get(course_level, 0.7)
        score = min(1.0, 0.85 * similarity + 0.15 * level_fit)
        scores.append((score, course))

    completed = set(payload.completedIds)
    ranked = sorted(scores, key=lambda pair: pair[0], reverse=True)
    results = []
    for score, course in ranked:
        if course["id"] in completed:
            continue
        interests = [x.lower() for x in payload.interests + payload.goals]
        text = course_text(course).lower()
        matching = [x for x in interests if x and x in text]
        reason = f"Matches your interest in {matching[0]}." if matching else f"Selected for your {payload.skillLevel} skill level and course content."
        results.append({"id": course["id"], "title": course["title"], "score": round(score, 4), "reason": reason})
        if len(results) >= payload.limit:
            break
    return {"recommendations": results}
