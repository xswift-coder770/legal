import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

import analyzeRoutes from "./routes/analyzeRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";


dotenv.config();

const app = express();

app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());
app.use("/api/chat", chatRoutes);

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "LegalMind AI Backend Running"
    });
});

app.use("/api/analyze", analyzeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/history", historyRoutes);

export default app;