import express from "express";
import { askQuestion } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";
import { sanitizeQuestion } from "../middleware/inputSanitizer.js";

const router = express.Router();

router.post(
    "/",
    protect,            // 🔐 Must be logged in
    sanitizeQuestion,   // 🛡️  Strip prompt injection attempts
    askQuestion
);

export default router;