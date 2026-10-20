import Analysis from "../models/Analysis.js";
import { deleteCollection } from "../config/chroma.js";

// ==========================
// Get User's Analysis History
// ==========================

export const getHistory = async (req, res) => {

    try {

        const userId = req.userId;

        // Only return analyses belonging to this user
        const history = await Analysis.find({ userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            history,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

// ==========================
// Delete User's Analysis
// ==========================

export const deleteHistory = async (req, res) => {

    try {

        const userId = req.userId;

        // ----------------------------------------
        // Find the analysis first — verify ownership
        // ----------------------------------------

        const analysis = await Analysis.findOne({
            _id:    req.params.id,
            userId,            // 🔐 Prevent cross-user deletion
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: "Analysis not found or you do not have permission to delete it.",
            });
        }

        // ----------------------------------------
        // Delete ChromaDB collection for this document
        // ----------------------------------------

        await deleteCollection(userId, req.params.id);

        // ----------------------------------------
        // Delete MongoDB record
        // ----------------------------------------

        await Analysis.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Analysis and associated vector data deleted.",
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};