import Analysis from "../models/Analysis.js";

// ==========================
// Get All Analysis History
// ==========================

export const getHistory = async (req, res) => {

    try {

        const history = await Analysis.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({

            success: true,

            history

        });

    }
    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ==========================
// Delete Analysis
// ==========================

export const deleteHistory = async (req, res) => {

    try {

        await Analysis.findByIdAndDelete(req.params.id);

        return res.status(200).json({

            success: true,

            message: "Analysis Deleted"

        });

    }
    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};