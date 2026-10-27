import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  status: { type: String, enum: ["enrolled", "completed"], default: "enrolled" },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
export default mongoose.model("Enrollment", enrollmentSchema);
