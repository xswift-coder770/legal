import generateEmbedding from "../services/embeddingService.js";
import { searchRelevantChunks } from "../services/retriever.js";
import { askAI } from "../services/groqService.js";
import Analysis from "../models/Analysis.js";

export const askQuestion = async (req, res) => {

    try {

        const { question, docId } = req.body;

        // =====================================
        // Validate Auth
        // =====================================

        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please log in.",
            });
        }


        // =====================================
        // Validate Question
        // =====================================

        if (!question || !question.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question is required.",
            });
        }


        // =====================================
        // Resolve docId
        // If docId is provided, query that document.
        // If missing, automatically resolve to user's latest policy.
        // =====================================

        let targetDocId = docId;

        if (!targetDocId || typeof targetDocId !== "string" || targetDocId === "undefined") {
            const latest = await Analysis.findOne({ userId }).sort({ createdAt: -1 });
            if (latest) {
                targetDocId = latest._id.toString();
            }
        }

        if (!targetDocId) {
            return res.status(200).json({
                success: true,
                question,
                retrievedChunks: [],
                answer: "You have not uploaded any legal policies yet. Please upload a PDF first.",
            });
        }


        // =====================================
        // Step 1: Generate Question Embedding
        // =====================================

        const questionEmbedding = await generateEmbedding(question.trim());


        // =====================================
        // Step 2: Retrieve Relevant Chunks
        //         Only from this user's document
        // =====================================

        const relevantChunks = await searchRelevantChunks(
            questionEmbedding,
            8,
            userId,
            targetDocId
        );


        console.log("Question:", question);

        console.log(
            "Retrieved Chunks:",
            relevantChunks.map(chunk => ({
                id:         chunk.id,
                similarity: Number(chunk.score.toFixed(4)),
            }))
        );


        // =====================================
        // No Chunks Available
        // =====================================

        if (!relevantChunks || relevantChunks.length === 0) {
            return res.status(200).json({
                success:        true,
                question,
                retrievedChunks: [],
                answer:
                    "No document context is available. Please upload a PDF first.",
            });
        }


        // =====================================
        // Step 3: Build Context
        // =====================================

        const context = relevantChunks
            .map(
                (item, index) =>
                    `Document Section ${index + 1}:\n${item.text}`
            )
            .join("\n\n");


        console.log("Context Length:", context.length);
        console.log("Context Preview:", context.substring(0, 1000));


        // =====================================
        // Step 4: Ask AI Using Context
        // =====================================

        const aiResult = await askAI(context, question);


        // =====================================
        // Step 5: Parse Response
        // =====================================

        let answer;

        try {

            const cleaned = aiResult
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            answer = JSON.parse(cleaned);

        } catch {

            answer = aiResult;

        }


        // =====================================
        // Step 6: Return Response
        // =====================================

        return res.status(200).json({

            success: true,

            question,

            retrievedChunks: relevantChunks.map(chunk => ({
                chunkId:    chunk.id,
                similarity: Number(chunk.score.toFixed(4)),
            })),

            answer,

        });

    } catch (error) {

        console.error("Chat Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};