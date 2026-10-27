import { Router } from "express";
import Course from "../models/Course.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = Router();
router.use(protect, adminOnly);

router.post("/courses", async (req, res) => {
  try {
    const { title, description, category, level = "beginner", tags = [], skills = [], durationHours = 1 } = req.body;
    if (!title?.trim() || !description?.trim() || !category?.trim()) return res.status(400).json({ message: "Title, description, and category are required" });
    const course = await Course.create({ title: title.trim(), description: description.trim(), category: category.trim(), level, tags, skills, durationHours, isPublished: false });
    res.status(201).json({ course });
  } catch {
    res.status(400).json({ message: "Unable to create course. Check required fields and unique title." });
  }
});

router.patch("/courses/:id", async (req, res) => {
  try {
    const allowed = ["title", "description", "category", "level", "tags", "skills", "durationHours", "imageUrl", "lessons", "prerequisites", "isPublished"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const course = await Course.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ course });
  } catch {
    res.status(400).json({ message: "Unable to update course" });
  }
});

router.delete("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch {
    res.status(400).json({ message: "Unable to delete course" });
  }
});

export default router;
