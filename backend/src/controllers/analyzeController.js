export const analyzePolicy = async (req, res) => {

    try {

        res.status(200).json({
            success: true,
            message: "Analyze API Working",
            data: null
        });

    }
    catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};