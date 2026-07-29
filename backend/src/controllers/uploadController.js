import documentLoader from "../services/documentLoader.js";
import textCleaner from "../services/textCleaner.js";
import chunkService from "../services/chunkService.js";
import generateEmbedding from "../services/embeddingService.js";
import calculateRisk from "../services/riskEngine.js";

import {
    storeEmbeddings,
    getAllChunks
} from "../services/retriever.js";
import generateFinalAnalysis, {
    analyzeBatch
} from "../services/groqService.js";
import Analysis from "../models/Analysis.js";

export const uploadPDF = async (req, res) => {

    try {

        // =============================
        // Validate Uploaded File
        // =============================

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "No PDF uploaded."
            });

        }

        // =============================
        // Step 1: Extract Text
        // =============================

        const extractedText = await documentLoader(req.file.path);

        // =============================
        // Step 2: Clean Text
        // =============================

        const cleanedText = textCleaner(extractedText);

        // =============================
        // Step 3: Chunk Text
        // =============================

        const chunks = chunkService(cleanedText);

        console.log("Total Chunks:", chunks.length);

        // =============================
        // Step 4: Generate Embeddings
        // =============================

        const embeddings = [];

        for (const chunk of chunks) {

            const embedding = await generateEmbedding(chunk);

            embeddings.push(embedding);

        }

        console.log("Total Embeddings:", embeddings.length);

        if (embeddings.length > 0) {

            console.log("Embedding Dimension:", embeddings[0].length);

        }

        // =============================
        // Step 5: Store Embeddings
        // =============================

        storeEmbeddings(chunks, embeddings);

        console.log("Embeddings Stored Successfully");

        // =============================
        // Step 6: Create Context
        // =============================

        const allChunks = getAllChunks();

const batchSize = 10;

const partialSummaries = [];

for (let i = 0; i < allChunks.length; i += batchSize) {

    const batch = allChunks
        .slice(i, i + batchSize)
        .join("\n\n");

    console.log(`Analyzing Batch ${i / batchSize + 1}`);

    const summary = await analyzeBatch(batch);

    partialSummaries.push(summary);

}

const finalContext = partialSummaries.join("\n\n");

const aiResult = await generateFinalAnalysis(finalContext);

        console.log("Raw AI Response:");
        console.log(aiResult);

        // =============================
        // Step 8: Parse AI Response
        // =============================

        let analysis;

        try {

            const cleanedResult = aiResult
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            analysis = JSON.parse(cleanedResult);

            analysis.riskScore = calculateRisk(analysis);

            console.log("JSON Parsed Successfully");

        }
        catch (parseError) {

            console.error("JSON Parsing Failed");
            console.error(parseError);

            analysis = {
                rawResponse: aiResult
            };

        }

        // =============================
        // Step 9: Return Response
        // =============================


 

await Analysis.create({

    fileName: req.file.originalname,

    documentType:
        analysis.documentType || "Unknown",

    summary:
        analysis.summary || "No Summary",

    riskScore:
        analysis.riskScore || 0,

    analysis

});

console.log("Analysis Saved Successfully");

        return res.status(200).json({

            success: true,

            message: "PDF Uploaded & Analyzed Successfully",

            file: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                path: req.file.path
            },

            characters: cleanedText.length,

            chunks: chunks.length,

            embeddingDimension:
                embeddings.length > 0
                    ? embeddings[0].length
                    : 0,

            storedChunks: chunks.length,

            preview: cleanedText.substring(0, 500),

            analysis

        });

    }
    catch (error) {

        console.error("Upload Error:", error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};