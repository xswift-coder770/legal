import documentLoader from "../services/documentLoader.js";
import textCleaner from "../services/textCleaner.js";
import chunkService from "../services/chunkService.js";
import generateEmbedding from "../services/embeddingService.js";
import calculateRisk from "../services/riskEngine.js";

import {
    storeEmbeddings,
    getAllChunks,
} from "../services/retriever.js";

import generateFinalAnalysis, {
    analyzeBatch,
} from "../services/groqService.js";

import Analysis from "../models/Analysis.js";
import { sanitizeText } from "../middleware/inputSanitizer.js";


// ============================================
// Limit Concurrent Tasks
// ============================================

const limitConcurrency = async (items, limit, asyncFn) => {

    const results = [];

    for (let i = 0; i < items.length; i += limit) {

        const batch = items.slice(i, i + limit);

        const batchResults = await Promise.all(
            batch.map((item, index) => asyncFn(item, i + index))
        );

        results.push(...batchResults);
    }

    return results;

};


// ============================================
// Upload & Analyze PDF
// ============================================

export const uploadPDF = async (req, res) => {

    try {

        // ========================================
        // Validate Uploaded File
        // ========================================

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No PDF uploaded.",
            });
        }

        // ========================================
        // Validate Auth — userId must come from JWT
        // ========================================

        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please log in.",
            });
        }


        // ========================================
        // Step 1: Extract Text
        // ========================================

        console.log("Extracting PDF text...");

        const extractedText = await documentLoader(req.file.path);


        // ========================================
        // Step 2: Sanitize Extracted Text
        //         (Prevent prompt injection from PDF)
        // ========================================

        console.log("Sanitizing extracted text for prompt injection...");

        const { sanitized: sanitizedText, injectionDetected } =
            sanitizeText(extractedText);

        if (injectionDetected) {
            console.warn(
                `⚠️  Prompt injection patterns detected in uploaded PDF: ${req.file.originalname}`
            );
        }


        // ========================================
        // Step 3: Clean Text
        // ========================================

        console.log("Cleaning extracted text...");

        const cleanedText = textCleaner(sanitizedText);


        // ========================================
        // Step 4: Chunk Text
        // ========================================

        console.log("Creating chunks...");

        const chunks = chunkService(cleanedText);

        console.log("Total Chunks:", chunks.length);


        // ========================================
        // Step 5: Generate Embeddings
        // ========================================

        console.log("Generating embeddings concurrently...");

        const embeddings = await limitConcurrency(
            chunks,
            10,
            async (chunk) => await generateEmbedding(chunk)
        );

        console.log("Total Embeddings:", embeddings.length);

        if (embeddings.length > 0) {
            console.log("Embedding Dimension:", embeddings[0].length);
        }


        // ========================================
        // Step 6: Create a Placeholder Analysis Record
        //         to get a stable docId for ChromaDB
        // ========================================

        const placeholder = await Analysis.create({
            userId,
            fileName:     req.file.originalname,
            documentType: "Processing...",
            summary:      "Processing...",
            riskScore:    0,
            analysis:     {},
        });

        const docId = placeholder._id.toString();


        // ========================================
        // Step 7: Store Embeddings in ChromaDB
        //         (Scoped to this user + document)
        // ========================================

        await storeEmbeddings(chunks, embeddings, userId, docId);

        console.log("Embeddings Stored in ChromaDB Successfully");


        // ========================================
        // Step 8: Prepare LLM Batches
        // ========================================

        const allChunks = await getAllChunks(userId, docId);

        const batchSize = 4;
        const batches   = [];

        for (let i = 0; i < allChunks.length; i += batchSize) {
            const batch = allChunks.slice(i, i + batchSize).join("\n\n");
            batches.push(batch);
        }

        console.log(`Processing ${batches.length} summarization batches...`);


        // ========================================
        // Step 9: Analyze Batches
        // ========================================

        const partialSummaries = await limitConcurrency(
            batches,
            2,
            async (batch, index) => {
                console.log(`Analyzing Batch ${index + 1}/${batches.length}`);
                return await analyzeBatch(batch);
            }
        );

        console.log("All batches analyzed successfully.");


        // ========================================
        // Step 10: Combine Partial Summaries
        // ========================================

        const finalContext = partialSummaries.join("\n\n");

        console.log("Generating final analysis...");


        // ========================================
        // Step 11: Final AI Analysis
        // ========================================

        const aiResult = await generateFinalAnalysis(finalContext);

        console.log("Raw AI Response:");
        console.log(aiResult);


        // ========================================
        // Step 12: Parse AI Response
        // ========================================

        let analysis;

        try {

            const cleanedResult = aiResult
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            analysis = JSON.parse(cleanedResult);

            analysis.riskScore = calculateRisk(analysis);

            console.log("JSON Parsed Successfully");

        } catch (parseError) {

            console.error("JSON Parsing Failed");
            console.error(parseError);

            analysis = { rawResponse: aiResult };

        }


        // ========================================
        // Step 13: Update Placeholder with Real Analysis
        // ========================================

        await Analysis.findByIdAndUpdate(docId, {
            documentType: analysis.documentType || "Unknown",
            summary:      analysis.summary      || "No Summary",
            riskScore:    analysis.riskScore    || 0,
            analysis,
        });

        console.log("Analysis Saved Successfully");


        // ========================================
        // Step 14: Send Response
        // ========================================

        return res.status(200).json({

            success: true,

            message: "PDF Uploaded & Analyzed Successfully",

            file: {
                filename:     req.file.filename,
                originalName: req.file.originalname,
                size:         req.file.size,
                path:         req.file.path,
            },

            docId,

            characters:       cleanedText.length,
            chunks:           chunks.length,
            embeddingDimension: embeddings.length > 0 ? embeddings[0].length : 0,
            storedChunks:     chunks.length,
            preview:          cleanedText.substring(0, 500),

            analysis,

        });

    } catch (error) {

        console.error("Upload Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};