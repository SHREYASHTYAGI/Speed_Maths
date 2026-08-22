const allowedCategories = ["addition", "subtraction", "multiplication", "division", "percentage"];

const getRangeForDifficulty = (difficulty) => {
  if (difficulty === "easy") return { min: 1, max: 10 };
  if (difficulty === "medium") return { min: 10, max: 99 };
  if (difficulty === "hard") return { min: 100, max: 999 };
  return { min: 1, max: 10 };
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateQuestionForCategory = (category, difficulty) => {
  const { min, max } = getRangeForDifficulty(difficulty);

  if (category === "addition") {
    const a = randomInt(min, max);
    const b = randomInt(min, max);
    return {
      question: `${a} + ${b} = ?`,
      answer: a + b,
    };
  }

  if (category === "subtraction") {
    const a = randomInt(min, max);
    const b = randomInt(min, max);
    const high = Math.max(a, b);
    const low = Math.min(a, b);
    return {
      question: `${high} - ${low} = ?`,
      answer: high - low,
    };
  }

  if (category === "multiplication") {
    const a = randomInt(min, max);
    const b = randomInt(1, 12);
    return {
      question: `${a} x ${b} = ?`,
      answer: a * b,
    };
  }

  if (category === "division") {
    const divisor = randomInt(2, 12);
    const quotient = randomInt(1, 12);
    const dividend = divisor * quotient;
    return {
      question: `${dividend} ÷ ${divisor} = ?`,
      answer: quotient,
    };
  }

  if (category === "percentage") {
    const percent = randomInt(5, 100);
    const whole = randomInt(min, max);
    const answer = Math.round((whole * percent) / 100);
    return {
      question: `${percent}% of ${whole} = ?`,
      answer,
    };
  }

  return generateQuestionForCategory("addition", difficulty);
};

const generateQuestion = (category, difficulty) => {
  if (!allowedCategories.includes(category)) {
    throw new Error("Invalid category");
  }

  const normalizedCategory = category.toLowerCase();
  return generateQuestionForCategory(normalizedCategory, difficulty);
};

module.exports = {
  generateQuestion,
};
