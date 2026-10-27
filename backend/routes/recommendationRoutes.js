import { Router } from "express";
import axios from "axios";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import QuizResult from "../models/QuizResult.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, async (req, res) => {
  try {
    const [courses, enrollments, quizResults] = await Promise.all([
      Course.find({ isPublished: true }).lean(),
      Enrollment.find({ userId: req.user._id }).lean(),
      QuizResult.find({ userId: req.user._id }).sort({ attemptedAt: -1 }).limit(20).lean()
    ]);
    const enrolledIds = new Set(enrollments.map(e => String(e.courseId)));
    const completedIds = enrollments.filter(e => e.status === "completed").map(e => String(e.courseId));
    const weakTopics = quizResults.filter(q => q.total > 0 && q.score / q.total < 0.6).map(q => q.topic);
    const response = await axios.post(`${process.env.AI_SERVICE_URL}/recommend`, {
      interests: req.user.interests,
      goals: [...req.user.goals, ...weakTopics],
      skillLevel: req.user.skillLevel,
      completedIds,
      limit: 20,
      courses: courses.map(c => ({
        id: String(c._id), title: c.title, description: c.description,
        category: c.category, level: c.level, tags: c.tags, skills: c.skills
      }))
    }, {
      timeout: 30000,
      headers: process.env.AI_SERVICE_KEY ? { "x-service-key": process.env.AI_SERVICE_KEY } : {}
    });
    const byId = new Map(courses.map(c => [String(c._id), c]));
    const recommendations = response.data.recommendations
      .map(item => ({ course: byId.get(item.id), score: item.score, reason: item.reason }))
      .filter(item => item.course && !enrolledIds.has(String(item.course._id)))
      .slice(0, 6);
    res.json({ recommendations, basedOn: { interests: req.user.interests, skillLevel: req.user.skillLevel, weakTopics: [...new Set(weakTopics)] } });
  } catch (error) {
    console.error("Recommendation error:", error.message);
    res.status(503).json({ message: "Recommendation service unavailable. Check the Python AI service." });
  }
});

export default router;
