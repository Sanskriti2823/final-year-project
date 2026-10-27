import { Router } from "express";
import axios from "axios";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", protect, async (req, res) => {
  const { message, courseTitle = "General learning" } = req.body;
  if (typeof message !== "string" || !message.trim()) return res.status(400).json({ message: "Enter a question first" });
  if (message.length > 4000) return res.status(400).json({ message: "Question is too long" });
  const { LLM_API_KEY, LLM_API_URL, LLM_MODEL } = process.env;
  if (!LLM_API_KEY || !LLM_API_URL || !LLM_MODEL) return res.status(503).json({ message: "AI assistant is not configured. Set LLM_API_URL, LLM_API_KEY, and LLM_MODEL in backend/.env." });
  try {
    const response = await axios.post(LLM_API_URL, {
      model: LLM_MODEL,
      messages: [
        { role: "system", content: `You are LearnSmart AI, a friendly educational tutor. Explain clearly for a computer science student. Use examples when helpful. Do not claim to have read materials that were not provided. Current course context: ${String(courseTitle).slice(0, 200)}` },
        { role: "user", content: message.trim() }
      ],
      temperature: 0.4
    }, { timeout: 30000, headers: { Authorization: `Bearer ${LLM_API_KEY}`, "Content-Type": "application/json" } });
    const answer = response.data?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) return res.status(502).json({ message: "AI provider returned no answer" });
    res.json({ answer });
  } catch (error) {
    console.error("LLM error:", error.response?.status || error.message);
    res.status(502).json({ message: "AI assistant request failed. Check provider settings and try again." });
  }
});

export default router;
