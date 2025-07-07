// Routes
import express from "express";
import {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  getMe,
  logoutUser,
  getAllUsers,
  updateUser,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";
const router = express.Router();

// Register User
router.post("/register", registerUser);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Get All Users
router.get("/get/all", authMiddleware, getAllUsers);

// Resend OTP
router.post("/resend-otp", resendOtp);

// Login User
router.post("/login", loginUser);

// Get Me
router.get("/me", authMiddleware, getMe);

// Logout User
router.post("/logout", authMiddleware, logoutUser);

// Update User
router.put("/update", authMiddleware, upload, updateUser);
export default router;
