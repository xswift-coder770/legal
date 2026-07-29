import generateEmbedding from "../services/embeddingService.js";
import { searchRelevantChunks } from "../services/retriever.js";
import { askAI } from "../services/groqService.js";

export const askQuestion = async (req, res) => {

    try {

        const { question } = req.body;

        if (!question) {

            return res.status(400).json({

                success: false,
                message: "Question is required."

            });

        }

        // Step 1: Generate Question Embedding
        const questionEmbedding = await generateEmbedding(question);

        // Step 2: Retrieve Relevant Chunks
        const relevantChunks = searchRelevantChunks(
            questionEmbedding,
            5
        );

        // Step 3: Build Context
        const context = relevantChunks
            .map(item => item.text)
            .join("\n\n");

        // Step 4: Ask AI
       const aiResult = await askAI(context, question);

        // Step 5: Parse JSON if possible
        let answer;

        try {

            const cleaned = aiResult
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            answer = JSON.parse(cleaned);

        }
        catch {

            answer = aiResult;

        }

        return res.status(200).json({

            success: true,

            question,

           retrievedChunks: relevantChunks.map(chunk => ({

    chunkId: chunk.id,

    similarity: Number(chunk.score.toFixed(4))

})),

            answer

        });

    }
    catch (error) {

        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

};