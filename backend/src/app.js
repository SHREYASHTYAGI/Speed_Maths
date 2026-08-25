const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const practiceRoutes = require("./routes/practice.routes");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL  || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Fast Maths API is running" });
});

app.use("/auth", authRoutes);
app.use("/practice", practiceRoutes);

module.exports = app;
