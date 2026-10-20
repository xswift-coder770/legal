import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ============================================
// Generate JWT Token
// ============================================

const generateToken = (userId) => {

    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

};

// ============================================
// Register New User
// POST /api/auth/register
// ============================================

export const register = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        // ----------------------------------------
        // Validate Input
        // ----------------------------------------

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required.",
            });
        }

        // ----------------------------------------
        // Check If User Already Exists
        // ----------------------------------------

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists.",
            });
        }

        // ----------------------------------------
        // Create User (password hashed via pre-save hook)
        // ----------------------------------------

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
        });

        // ----------------------------------------
        // Generate Token
        // ----------------------------------------

        const token = generateToken(user._id.toString());

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {

        console.error("Register Error:", error);

        // Handle Mongoose duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Registration failed. Please try again.",
        });

    }

};

// ============================================
// Login Existing User
// POST /api/auth/login
// ============================================

export const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        // ----------------------------------------
        // Validate Input
        // ----------------------------------------

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        // ----------------------------------------
        // Find User (include password for comparison)
        // ----------------------------------------

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // ----------------------------------------
        // Verify Password
        // ----------------------------------------

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // ----------------------------------------
        // Generate Token
        // ----------------------------------------

        const token = generateToken(user._id.toString());

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {

        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again.",
        });

    }

};

// ============================================
// Get Current User Profile
// GET /api/auth/me
// ============================================

export const getMe = async (req, res) => {

    return res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        },
    });

};
