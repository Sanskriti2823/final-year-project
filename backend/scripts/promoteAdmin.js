import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

try {
  await mongoose.connect(process.env.MONGO_URI);
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error("Usage: node scripts/promoteAdmin.js user@example.com");
  const user = await User.findOneAndUpdate({ email }, { $set: { role: "admin" } }, { new: true });
  if (!user) throw new Error("User not found. Register the account first.");
  console.log(`Admin role assigned to ${user.email}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
