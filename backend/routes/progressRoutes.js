import { Router } from "express";
import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.js";
import QuizResult from "../models/QuizResult.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, async (req, res) => {
  try {
    const [enrollments, quizResults] = await Promise.all([
      Enrollment.find({ userId: req.user._id }).populate("courseId", "title category durationHours").lean(),
      QuizResult.find({ userId: req.user._id }).sort({ attemptedAt: -1 }).limit(100).lean()
    ]);
    const valid = enrollments.filter(e => e.courseId);
    const total = valid.length;
    const completed = valid.filter(e => e.status === "completed").length;
    const avg = total ? Math.round(valid.reduce((s, e) => s + e.progress, 0) / total) : 0;
    const totalQuestions = quizResults.reduce((s, q) => s + q.total, 0);
    const correct = quizResults.reduce((s, q) => s + q.score, 0);
    res.json({ summary: { totalCourses: total, completedCourses: completed, averageProgress: avg, quizAttempts: quizResults.length, quizAccuracy: totalQuestions ? Math.round(correct / totalQuestions * 100) : 0 }, enrollments: valid, quizResults });
  } catch {
    res.status(500).json({ message: "Unable to load progress" });
  }
});

router.patch("/:enrollmentId", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.enrollmentId)) return res.status(400).json({ message: "Invalid enrollment ID" });
    const progress = req.body.progress;
    if (!Number.isInteger(progress) || progress < 0 || progress > 100) return res.status(400).json({ message: "Progress must be an integer from 0 to 100" });
    const enrollment = await Enrollment.findOne({ _id: req.params.enrollmentId, userId: req.user._id });
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
    enrollment.progress = progress;
    enrollment.status = progress === 100 ? "completed" : "enrolled";
    enrollment.completedAt = progress === 100 ? new Date() : null;
    await enrollment.save();
    res.json({ enrollment });
  } catch {
    res.status(400).json({ message: "Unable to update progress" });
  }
});

export default router;
