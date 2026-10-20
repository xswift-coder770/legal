import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
    {
        // ============================================
        // User Association — strict data isolation
        // ============================================

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true, // fast lookup by user
        },

        // ============================================
        // Document Info
        // ============================================

        fileName: {
            type: String,
            required: true,
        },

        documentType: {
            type: String,
            required: true,
        },

        summary: {
            type: String,
            required: true,
        },

        riskScore: {
            type: Number,
            required: true,
        },

        analysis: {
            type: Object,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Analysis", analysisSchema);