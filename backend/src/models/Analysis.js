import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
    {
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