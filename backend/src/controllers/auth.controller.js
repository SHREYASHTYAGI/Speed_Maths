const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Token = require("../models/token.model");

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    process.env.ACC_SEC,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REF_SEC,
    { expiresIn: "7d" }
  );
};

const saveRefreshToken = async (userId, refreshToken) => {
  const tokenHash = await bcrypt.hash(refreshToken, 10);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Token.findOneAndDelete({ userId });
  await Token.create({ userId, token: tokenHash, expiresAt });
};

const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Username, email and password are required",
    });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await saveRefreshToken(user._id, refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await saveRefreshToken(user._id, refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const refresh = async (req, res) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;

  if (!refreshTokenFromCookie) {
    return res.status(401).json({
      success: false,
      message: "Refresh token required",
    });
  }

  try {
    const decoded = jwt.verify(
      refreshTokenFromCookie,
      process.env.REF_SEC 
    );

    const tokenRecord = await Token.findOne({ userId: decoded.id });
    if (!tokenRecord) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const isValid = await bcrypt.compare(refreshTokenFromCookie, tokenRecord.token);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const accessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REF_SEC 
      );
      await Token.deleteMany({ userId: decoded.id });
    } catch (error) {
      // ignore invalid token
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out",
  });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};
