const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mode: {
      type: String,
      required: true,
      enum: ["stopwatch", "timer"],
    },
    timeLimit: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
    },
    category: {
      type: String,
      required: true,
      enum: ["addition", "subtraction", "multiplication", "division", "percentage"],
    },
    currentQuestion: {
      type: String,
      default: "",
    },
    currentAnswer: {
      type: Number,
      default: null,
    },
    questionsSolved: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
