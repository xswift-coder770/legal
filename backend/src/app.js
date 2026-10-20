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
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        const cleanOrigin = origin.replace(/\/$/, "");
        const cleanFrontend = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : null;

        // Allow localhost, configured FRONTEND_URL, and ANY *.vercel.app domain (production + previews)
        const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin);
        const isExactMatch = cleanFrontend && cleanOrigin === cleanFrontend;
        const isVercelDomain = /^https:\/\/[a-zA-Z0-9_.-]+\.vercel\.app$/.test(cleanOrigin);

        if (isLocalhost || isExactMatch || isVercelDomain) {
            return callback(null, true);
        }

        console.warn(`Blocked by CORS origin: ${origin}`);
        return callback(null, false);
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