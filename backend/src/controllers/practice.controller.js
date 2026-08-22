const Session = require("../models/session.model");
const { generateQuestion } = require("../services/question.service");

const validModes = ["stopwatch", "timer"];
const validCategories = ["addition", "subtraction", "multiplication", "division", "percentage"];
const validDifficulties = ["easy", "medium", "hard"];

const startPractice = async (req, res) => {
  const { mode, category, difficulty, timeLimit } = req.body;

  if (!mode || !validModes.includes(mode)) {
    return res.status(400).json({ success: false, message: "Invalid mode" });
  }

  if (!category || !validCategories.includes(category)) {
    return res.status(400).json({ success: false, message: "Invalid category" });
  }

  if (!difficulty || !validDifficulties.includes(difficulty)) {
    return res.status(400).json({ success: false, message: "Invalid difficulty" });
  }

  if (mode === "timer" && ![300, 600, 900].includes(Number(timeLimit))) {
    return res.status(400).json({ success: false, message: "Invalid timer value" });
  }

  if (mode === "stopwatch" && timeLimit !== undefined && Number(timeLimit) < 0) {
    return res.status(400).json({ success: false, message: "Invalid timer value" });
  }

  try {
    const questionData = generateQuestion(category, difficulty);
    const session = await Session.create({
      userId: req.user._id,
      mode,
      category,
      difficulty,
      timeLimit: mode === "timer" ? Number(timeLimit) : 0,
      currentQuestion: questionData.question,
      currentAnswer: questionData.answer,
      questionsSolved: 0,
    });

    return res.status(200).json({
      success: true,
      sessionId: session._id,
      question: questionData.question,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const answerQuestion = async (req, res) => {
  const { sessionId, answer } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: "Session ID required" });
  }

  try {
    const session = await Session.findOne({ _id: sessionId, userId: req.user._id });

    if (!session) {
      return res.status(404).json({ success: false, message: "Invalid session" });
    }

    if (session.endedAt) {
      return res.status(400).json({ success: false, message: "Session already ended" });
    }

    const parsedAnswer = Number(answer);
    if (Number.isNaN(parsedAnswer)) {
      return res.status(400).json({ success: false, message: "Answer must be a number" });
    }

    if (parsedAnswer !== session.currentAnswer) {
      return res.status(200).json({
        success: true,
        correct: false,
        question: session.currentQuestion,
        questionsSolved: session.questionsSolved,
      });
    }

    session.questionsSolved += 1;
    const nextQuestion = generateQuestion(session.category, session.difficulty);
    session.currentQuestion = nextQuestion.question;
    session.currentAnswer = nextQuestion.answer;

    await session.save();

    return res.status(200).json({
      success: true,
      correct: true,
      question: nextQuestion.question,
      questionsSolved: session.questionsSolved,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const stopPractice = async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: "Session ID required" });
  }

  try {
    const session = await Session.findOne({ _id: sessionId, userId: req.user._id });

    if (!session) {
      return res.status(404).json({ success: false, message: "Invalid session" });
    }

    if (!session.endedAt) {
      session.endedAt = new Date();
      await session.save();
    }

    return res.status(200).json({
      success: true,
      message: "Session ended",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  startPractice,
  answerQuestion,
  stopPractice,
};
