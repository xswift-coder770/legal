import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ============================================
// Protect Route — Verify JWT Token
// ============================================

export const protect = async (req, res, next) => {

    try {

        // ----------------------------------------
        // Extract Token from Authorization Header
        // ----------------------------------------

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }

        const token = authHeader.split(" ")[1];

        // ----------------------------------------
        // Verify Token
        // ----------------------------------------

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token. Please log in again.",
            });
        }

        // ----------------------------------------
        // Attach User to Request
        // ----------------------------------------

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User associated with this token no longer exists.",
            });
        }

        req.userId = user._id.toString();
        req.user = user;

        next();

    } catch (error) {

        console.error("Auth Middleware Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal authentication error.",
        });

    }

};
