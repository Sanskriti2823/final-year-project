import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
  console.error("Set JWT_SECRET to a random string of at least 24 characters in backend/.env");
  process.exit(1);
}

const app = express();
const allowedOrigins = new Set(
  (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean)
);
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.add("http://localhost:5173");
  allowedOrigins.add("http://127.0.0.1:5173");
}
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(origin));
  }
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "learnsmart-backend" }));
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use((req, res) => res.status(404).json({ message: "API route not found" }));
app.use((error, req, res, next) => {
  console.error(error.message);
  res.status(500).json({ message: "Internal server error" });
});

const port = process.env.PORT || 5000;
try {
  await connectDB();
  app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
} catch (error) {
  console.error("Backend startup failed:", error.message);
  process.exit(1);
}
