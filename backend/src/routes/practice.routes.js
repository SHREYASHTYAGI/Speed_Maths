const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { startPractice, answerQuestion, stopPractice } = require("../controllers/practice.controller");

const router = express.Router();

router.use(authMiddleware);
router.post("/start", startPractice);
router.post("/answer", answerQuestion);
router.post("/stop", stopPractice);

module.exports = router;
