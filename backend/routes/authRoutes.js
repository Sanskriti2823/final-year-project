import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    interests: user.interests,
    goals: user.goals,
    skillLevel: user.skillLevel
  };
}

function makeToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, interests = [], goals = [], skillLevel = "beginner" } = req.body;
    if (!name?.trim() || !email?.trim() || typeof password !== "string") {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    if (password.length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters" });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      interests: Array.isArray(interests) ? interests.filter(x => typeof x === "string").slice(0, 20) : [],
      goals: Array.isArray(goals) ? goals.filter(x => typeof x === "string").slice(0, 20) : [],
      skillLevel: ["beginner", "intermediate", "advanced"].includes(skillLevel) ? skillLevel : "beginner"
    });
    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Email is already registered" });
    res.status(500).json({ message: "Unable to register account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const user = await User.findOne({ email }).select("+password");
    if (!user || typeof password !== "string" || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ token: makeToken(user), user: publicUser(user) });
  } catch {
    res.status(500).json({ message: "Unable to sign in" });
  }
});

router.get("/me", protect, (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
