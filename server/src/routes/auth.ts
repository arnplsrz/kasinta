import express from "express";
import { body } from "express-validator";
import * as authController from "../controllers/authController";
import { auth } from "../middleware/auth";
import passport from "../middleware/passport";

const router = express.Router();

// Validation middleware
const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("age")
    .isInt({ min: 18, max: 100 })
    .withMessage("Age must be between 18 and 100"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Routes
router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.post("/logout", auth, authController.logout);
router.get("/me", auth, authController.getCurrentUser);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
  }),
  authController.googleCallback
);

export default router;
