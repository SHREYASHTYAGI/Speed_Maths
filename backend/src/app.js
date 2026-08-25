const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth.routes");
const practiceRoutes = require("./routes/practice.routes");

const app = express();

const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://speed-maths-tau.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean).map((origin) => origin.trim().replace(/\/$/, "")));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Fast Maths API is running" });
});

app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database unavailable. Please try again shortly.",
    });
  }

  return next();
});

app.use("/auth", authRoutes);
app.use("/practice", practiceRoutes);

module.exports = app;
