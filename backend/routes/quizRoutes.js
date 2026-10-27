import { Router } from "express";
import QuizResult from "../models/QuizResult.js";
import Course from "../models/Course.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
const questions = [
  { id: "q1", topic: "Python", question: "Which keyword defines a function in Python?", options: ["func", "def", "function", "define"], answer: 1, explanation: "Python uses def to define a function." },
  { id: "q2", topic: "JavaScript", question: "Which method parses JSON text?", options: ["JSON.stringify()", "JSON.parse()", "Object.create()", "JSON.convert()"], answer: 1, explanation: "JSON.parse converts JSON text into a JavaScript value." },
  { id: "q3", topic: "Databases", question: "Which MongoDB structure contains documents?", options: ["Collections", "Functions", "Packages", "CSS files"], answer: 0, explanation: "MongoDB collections contain documents." },
  { id: "q4", topic: "Machine Learning", question: "What does classification predict?", options: ["A category", "Only a file path", "A URL", "A password"], answer: 0, explanation: "Classification predicts a discrete category or class." },
  { id: "q5", topic: "Cybersecurity", question: "Why should passwords be hashed?", options: ["To publish them", "To store a one-way representation", "To disable login", "To share them"], answer: 1, explanation: "A password hash allows verification without storing the original password." }
];

router.get("/", protect, (req, res) => res.json({
  questions: questions.map(({ answer, explanation, ...q }) => q)
}));

router.post("/submit", protect, async (req, res) => {
  try {
    const { answers, courseId } = req.body;
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) return res.status(400).json({ message: "Answers must be an object" });
    const course = await Course.findOne({ _id: courseId, isPublished: true });
    if (!course) return res.status(400).json({ message: "Choose a valid published course" });
    let score = 0;
    const results = questions.map(q => {
      const submitted = answers[q.id];
      const correct = Number(submitted) === q.answer;
      if (correct) score++;
      const index = Number(submitted);
      return { question: q.question, topic: q.topic, correct, selectedAnswer: Number.isInteger(index) ? (q.options[index] ?? "Not answered") : "Not answered", correctAnswer: q.options[q.answer], explanation: q.explanation };
    });
    const result = await QuizResult.create({
      userId: req.user._id, courseId: course._id,
      topic: [...new Set(questions.map(q => q.topic))].join(", "),
      score, total: questions.length
    });
    res.json({ resultId: result._id, score, total: questions.length, percentage: Math.round(score / questions.length * 100), feedback: score / questions.length < 0.6 ? "Review the explanations and try again." : "Good work! Continue learning.", results });
  } catch {
    res.status(500).json({ message: "Unable to submit quiz" });
  }
});

router.get("/history", protect, async (req, res) => {
  const history = await QuizResult.find({ userId: req.user._id }).populate("courseId", "title category").sort({ attemptedAt: -1 }).limit(50);
  res.json({ history });
});

export default router;
