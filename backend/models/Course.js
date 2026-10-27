import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" },
  order: { type: Number, default: 1 }
}, { _id: false });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  tags: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  prerequisites: { type: [String], default: [] },
  durationHours: { type: Number, default: 1 },
  imageUrl: { type: String, default: "" },
  lessons: { type: [lessonSchema], default: [] },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Course", courseSchema);
