import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes    from "./routes/authRoutes.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import uploadRoutes  from "./routes/uploadRoutes.js";
import chatRoutes    from "./routes/chatRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";


const app = express();

// ============================================
// Security Headers
// ============================================

app.use(helmet());

// ============================================
// CORS
// ============================================

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like Postman/curl) or any localhost port
        if (!origin) return callback(null, true);

        const cleanOrigin = origin.replace(/\/$/, "");
        const cleanFrontend = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : null;

        if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin) || cleanOrigin === cleanFrontend) {
            return callback(null, true);
        }
        return callback(new Error("CORS policy does not allow access from this origin."));
    },
    credentials: true,
}));

// ============================================
// Logging
// ============================================

app.use(morgan("dev"));

// ============================================
// Body Parsers
// ============================================

app.use(express.json({ limit: "10kb" }));         // limit JSON body size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ============================================
// Routes
// ============================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "LegalMind AI Backend Running",
    });
});

app.use("/api/auth",    authRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/upload",  uploadRoutes);
app.use("/api/chat",    chatRoutes);
app.use("/api/history", historyRoutes);

export default app;