import express from "express";
import upload from "../config/multer.js";
import { uploadPDF } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/pdf",
    protect,              // 🔐 Must be logged in
    upload.single("file"),
    uploadPDF
);

export default router;