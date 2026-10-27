import { Router } from "express";
import mongoose from "mongoose";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).sort({ category: 1, title: 1 }).lean();
    res.json({ courses });
  } catch {
    res.status(500).json({ message: "Unable to load courses" });
  }
});

router.get("/:id", protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid course ID" });
  const course = await Course.findOne({ _id: req.params.id, isPublished: true });
  if (!course) return res.status(404).json({ message: "Course not found" });
  res.json({ course });
});

router.post("/:id/enroll", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid course ID" });
    const course = await Course.findOne({ _id: req.params.id, isPublished: true });
    if (!course) return res.status(404).json({ message: "Course not found" });
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: req.user._id, courseId: course._id },
      { $setOnInsert: { userId: req.user._id, courseId: course._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ enrollment, message: "Enrollment saved" });
  } catch (error) {
    if (error.code === 11000) {
      const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId: req.params.id });
      return res.json({ enrollment, message: "Already enrolled" });
    }
    res.status(500).json({ message: "Unable to enroll" });
  }
});

export default router;
