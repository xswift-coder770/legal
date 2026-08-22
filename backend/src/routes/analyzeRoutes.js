import express from "express";
import { analyzePolicy } from "../controllers/analyzeController.js";

const router = express.Router();

router.post("/", analyzePolicy);

export default router;