import express from "express";
import {
  forgotPassword,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
} from "../controllers/user.controllers.js";
import { verifyToken } from "../middlewares/verify.token.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);

router.put("/reset-password", resetPassword);

router.post("/logout", logoutUser);

// Authenticated Routes
router.get("/me", verifyToken, getUser);

export default router;
