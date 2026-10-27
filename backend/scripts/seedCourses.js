import "dotenv/config";
import mongoose from "mongoose";
import Course from "../models/Course.js";

const courses = [
  { title: "Python Programming", category: "Programming", level: "beginner", description: "Learn Python syntax, variables, loops and functions.", tags: ["python", "basics", "coding"], skills: ["Python"], durationHours: 12 },
  { title: "Advanced Python", category: "Programming", level: "advanced", description: "Master object-oriented programming, decorators and generators.", tags: ["python", "oop"], skills: ["Python", "OOP"], durationHours: 18 },
  { title: "Full Stack MERN", category: "Web Development", level: "intermediate", description: "Build full-stack apps with React, Express, Node.js and MongoDB.", tags: ["mern", "react", "node"], skills: ["React", "Node.js", "MongoDB"], durationHours: 30 },
  { title: "React for Beginners", category: "Web Development", level: "beginner", description: "Learn components, props, state, hooks and routing.", tags: ["react", "frontend"], skills: ["React", "JavaScript"], durationHours: 15 },
  { title: "Node.js and Express", category: "Web Development", level: "intermediate", description: "Create REST APIs, middleware and backend services.", tags: ["node", "express", "api"], skills: ["Node.js", "Express"], durationHours: 16 },
  { title: "MongoDB Essentials", category: "Database", level: "beginner", description: "Understand documents, collections, queries and indexes.", tags: ["mongodb", "database"], skills: ["MongoDB"], durationHours: 10 },
  { title: "Machine Learning Basics", category: "Artificial Intelligence", level: "beginner", description: "Explore regression, classification and model evaluation.", tags: ["machine learning", "ml"], skills: ["Python", "ML"], durationHours: 20 },
  { title: "Natural Language Processing", category: "Artificial Intelligence", level: "advanced", description: "Explore text processing, vectorization and language models.", tags: ["nlp", "ai", "text"], skills: ["Python", "NLP"], durationHours: 24 },
  { title: "Cybersecurity Fundamentals", category: "Cybersecurity", level: "beginner", description: "Learn networking, authentication, encryption and common threats.", tags: ["security", "network"], skills: ["Cybersecurity", "Networking"], durationHours: 14 },
  { title: "Data Structures and Algorithms", category: "Computer Science", level: "intermediate", description: "Study arrays, linked lists, trees, graphs and time complexity.", tags: ["dsa", "algorithms"], skills: ["DSA", "Problem Solving"], durationHours: 22 },
  { title: "Cloud Computing with AWS", category: "Cloud Computing", level: "intermediate", description: "Learn cloud compute, storage, networking and deployment.", tags: ["aws", "cloud"], skills: ["Cloud", "AWS"], durationHours: 18 },
  { title: "SQL and Database Design", category: "Database", level: "beginner", description: "Learn SQL queries, joins, normalization and schema design.", tags: ["sql", "dbms"], skills: ["SQL", "DBMS"], durationHours: 12 }
];

try {
  await mongoose.connect(process.env.MONGO_URI);
  for (const course of courses) {
    await Course.updateOne({ title: course.title }, { $set: { ...course, isPublished: true } }, { upsert: true });
  }
  console.log(`Seeded ${courses.length} courses`);
} catch (error) {
  console.error("Seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
