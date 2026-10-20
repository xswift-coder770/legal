import express from "express";
import { getHistory, deleteHistory } from "../controllers/historyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(   "/",    protect, getHistory);
router.delete("/:id", protect, deleteHistory);

export default router;