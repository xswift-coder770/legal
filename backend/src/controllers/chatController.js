// import generateEmbedding from "../services/embeddingService.js";
// import { searchRelevantChunks } from "../services/retriever.js";
// import { askAI } from "../services/groqService.js";

// export const askQuestion = async (req, res) => {

//     try {

//         const { question } = req.body;

//         if (!question) {

//             return res.status(400).json({

//                 success: false,
//                 message: "Question is required."

//             });

//         }

//         // Step 1: Generate Question Embedding
//         const questionEmbedding = await generateEmbedding(question);

//         // Step 2: Retrieve Relevant Chunks
//         const relevantChunks = searchRelevantChunks(
//             questionEmbedding,
//             8

//         );

//         // Step 3: Build Context
//         const context = relevantChunks
//             .map(item => item.text)
//             .join("\n\n");

//         // Step 4: Ask AI
//        const aiResult = await askAI(context, question);

//         // Step 5: Parse JSON if possible
//         let answer;

//         try {

//             const cleaned = aiResult
//                 .replace(/```json/g, "")
//                 .replace(/```/g, "")
//                 .trim();

//             answer = JSON.parse(cleaned);

//         }
//         catch {

//             answer = aiResult;

//         }

//         return res.status(200).json({

//             success: true,

//             question,

//            retrievedChunks: relevantChunks.map(chunk => ({

//     chunkId: chunk.id,

//     similarity: Number(chunk.score.toFixed(4))

// })),

//             answer

//         });

//     }
//     catch (error) {

//         return res.status(500).json({

//             success: false,
//             message: error.message

//         });

//     }

// };















import generateEmbedding from "../services/embeddingService.js";
import { searchRelevantChunks } from "../services/retriever.js";
import { askAI } from "../services/groqService.js";

export const askQuestion = async (req, res) => {

    try {

        const { question } = req.body;

        // =====================================
        // Validate Question
        // =====================================

        if (!question || !question.trim()) {

            return res.status(400).json({

                success: false,

                message: "Question is required."

            });

        }


        // =====================================
        // Step 1: Generate Question Embedding
        // =====================================

        const questionEmbedding =
            await generateEmbedding(
                question.trim()
            );


        // =====================================
        // Step 2: Retrieve Relevant Chunks
        // =====================================

        const relevantChunks =
            searchRelevantChunks(
                questionEmbedding,
                8
            );


        console.log(
            "Question:",
            question
        );

        console.log(
            "Retrieved Chunks:",
            relevantChunks.map(chunk => ({

                id: chunk.id,

                similarity:
                    Number(
                        chunk.score.toFixed(4)
                    )

            }))
        );


        // =====================================
        // No Chunks Available
        // =====================================

        if (
            !relevantChunks ||
            relevantChunks.length === 0
        ) {

            return res.status(200).json({

                success: true,

                question,

                retrievedChunks: [],

                answer:
                    "No document context is available. Please upload a PDF first."

            });

        }


        // =====================================
        // Step 3: Build Context
        // =====================================

        const context =
            relevantChunks
                .map(
                    (item, index) =>
                        `Document Section ${index + 1}:\n${item.text}`
                )
                .join("\n\n");


        console.log(
            "Context Length:",
            context.length
        );

        console.log(
            "Context Preview:",
            context.substring(
                0,
                1000
            )
        );


        // =====================================
        // Step 4: Ask AI Using Context
        // =====================================

        const aiResult =
            await askAI(
                context,
                question
            );


        // =====================================
        // Step 5: Parse Response
        // =====================================

        let answer;

        try {

            const cleaned =
                aiResult
                    .replace(
                        /```json/g,
                        ""
                    )
                    .replace(
                        /```/g,
                        ""
                    )
                    .trim();


            answer =
                JSON.parse(
                    cleaned
                );

        }
        catch {

            answer =
                aiResult;

        }


        // =====================================
        // Step 6: Return Response
        // =====================================

        return res.status(200).json({

            success: true,

            question,

            retrievedChunks:
                relevantChunks.map(
                    chunk => ({

                        chunkId:
                            chunk.id,

                        similarity:
                            Number(
                                chunk.score.toFixed(4)
                            )

                    })
                ),

            answer

        });

    }

    catch (error) {

        console.error(
            "Chat Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};