 

//nice



// import documentLoader from "../services/documentLoader.js";
// import textCleaner from "../services/textCleaner.js";
// import chunkService from "../services/chunkService.js";
// import generateEmbedding from "../services/embeddingService.js";
// import calculateRisk from "../services/riskEngine.js";

// import {
//     storeEmbeddings,
//     getAllChunks
// } from "../services/retriever.js";

// import generateFinalAnalysis, {
//     analyzeBatch
// } from "../services/groqService.js";

// import Analysis from "../models/Analysis.js";


// // =====================================
// // Limit Concurrent Tasks
// // =====================================

// const limitConcurrency = async (items, limit, asyncFn) => {

//     const results = [];

//     for (let i = 0; i < items.length; i += limit) {

//         const batch = items.slice(i, i + limit);

//         const batchResults = await Promise.all(
//             batch.map((item, index) =>
//                 asyncFn(item, i + index)
//             )
//         );

//         results.push(...batchResults);
//     }

//     return results;
// };


// // =====================================
// // Upload & Analyze PDF
// // =====================================

// export const uploadPDF = async (req, res) => {

//     try {

//         // =====================================
//         // Validate Uploaded File
//         // =====================================

//         if (!req.file) {

//             return res.status(400).json({
//                 success: false,
//                 message: "No PDF uploaded."
//             });

//         }


//         // =====================================
//         // Step 1: Extract Text
//         // =====================================

//         console.log("Extracting PDF text...");

//         const extractedText = await documentLoader(
//             req.file.path
//         );


//         // =====================================
//         // Step 2: Clean Text
//         // =====================================

//         console.log("Cleaning extracted text...");

//         const cleanedText = textCleaner(
//             extractedText
//         );


//         // =====================================
//         // Step 3: Chunk Text
//         // =====================================

//         console.log("Creating chunks...");

//         const chunks = chunkService(
//             cleanedText
//         );

//         console.log(
//             "Total Chunks:",
//             chunks.length
//         );


//         // =====================================
//         // Step 4: Generate Embeddings
//         // =====================================

//         console.log(
//             "Generating embeddings concurrently..."
//         );

//         const embeddings = await limitConcurrency(
//             chunks,
//             10,
//             async (chunk) => {

//                 return await generateEmbedding(
//                     chunk
//                 );

//             }
//         );

//         console.log(
//             "Total Embeddings:",
//             embeddings.length
//         );


//         if (embeddings.length > 0) {

//             console.log(
//                 "Embedding Dimension:",
//                 embeddings[0].length
//             );

//         }


//         // =====================================
//         // Step 5: Store Embeddings
//         // =====================================

//         storeEmbeddings(
//             chunks,
//             embeddings
//         );

//         console.log(
//             "Embeddings Stored Successfully"
//         );


//         // =====================================
//         // Step 6: Create LLM Batches
//         // =====================================

//         const allChunks = getAllChunks();

//         // Smaller batches reduce Groq token usage
//         const batchSize = 5;

//         const batches = [];

//         for (
//             let i = 0;
//             i < allChunks.length;
//             i += batchSize
//         ) {

//             const batch = allChunks
//                 .slice(i, i + batchSize)
//                 .join("\n\n");

//             batches.push(batch);
//         }


//         console.log(
//             `Processing ${batches.length} summarization batches sequentially...`
//         );


//         // =====================================
//         // Step 7: Analyze Batches
//         // =====================================

//         // IMPORTANT:
//         // Concurrency = 1
//         // Prevents Groq TPM rate-limit errors

//         const partialSummaries =
//             await limitConcurrency(
//                 batches,
//                 1,
//                 async (batch, index) => {

//                     console.log(
//                         `Analyzing Batch ${index + 1}/${batches.length}`
//                     );

//                     return await analyzeBatch(
//                         batch
//                     );

//                 }
//             );


//         console.log(
//             "All batches analyzed successfully."
//         );


//         // =====================================
//         // Step 8: Combine Partial Summaries
//         // =====================================

//         const finalContext =
//             partialSummaries.join("\n\n");


//         console.log(
//             "Generating final analysis..."
//         );


//         // =====================================
//         // Step 9: Final Groq Analysis
//         // =====================================

//         const aiResult =
//             await generateFinalAnalysis(
//                 finalContext
//             );


//         console.log(
//             "Raw AI Response:"
//         );

//         console.log(aiResult);


//         // =====================================
//         // Step 10: Parse AI Response
//         // =====================================

//         let analysis;

//         try {

//             const cleanedResult =
//                 aiResult
//                     .replace(/```json/g, "")
//                     .replace(/```/g, "")
//                     .trim();


//             analysis =
//                 JSON.parse(cleanedResult);


//             // =================================
//             // Calculate Application Risk Score
//             // =================================

//             analysis.riskScore =
//                 calculateRisk(
//                     analysis
//                 );


//             console.log(
//                 "JSON Parsed Successfully"
//             );

//         }
//         catch (parseError) {

//             console.error(
//                 "JSON Parsing Failed"
//             );

//             console.error(
//                 parseError
//             );


//             analysis = {

//                 rawResponse:
//                     aiResult

//             };

//         }


//         // =====================================
//         // Step 11: Save Analysis to MongoDB
//         // =====================================

//         await Analysis.create({

//             fileName:
//                 req.file.originalname,

//             documentType:
//                 analysis.documentType ||
//                 "Unknown",

//             summary:
//                 analysis.summary ||
//                 "No Summary",

//             riskScore:
//                 analysis.riskScore ||
//                 0,

//             analysis

//         });


//         console.log(
//             "Analysis Saved Successfully"
//         );


//         // =====================================
//         // Step 12: Send Response
//         // =====================================

//         return res.status(200).json({

//             success: true,

//             message:
//                 "PDF Uploaded & Analyzed Successfully",


//             file: {

//                 filename:
//                     req.file.filename,

//                 originalName:
//                     req.file.originalname,

//                 size:
//                     req.file.size,

//                 path:
//                     req.file.path

//             },


//             characters:
//                 cleanedText.length,


//             chunks:
//                 chunks.length,


//             embeddingDimension:
//                 embeddings.length > 0
//                     ? embeddings[0].length
//                     : 0,


//             storedChunks:
//                 chunks.length,


//             preview:
//                 cleanedText.substring(
//                     0,
//                     500
//                 ),


//             analysis

//         });

//     }

//     catch (error) {

//         console.error(
//             "Upload Error:",
//             error
//         );


//         return res.status(500).json({

//             success: false,

//             message:
//                 error.message

//         });

//     }

// };
























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


// ============================================
// Limit Concurrent Tasks
// ============================================

const limitConcurrency = async (
    items,
    limit,
    asyncFn
) => {

    const results = [];

    for (
        let i = 0;
        i < items.length;
        i += limit
    ) {

        const batch =
            items.slice(i, i + limit);

        const batchResults =
            await Promise.all(
                batch.map(
                    (item, index) =>
                        asyncFn(
                            item,
                            i + index
                        )
                )
            );

        results.push(...batchResults);
    }

    return results;
};


// ============================================
// Upload PDF
// ============================================

export const uploadPDF = async (req, res) => {

    try {

        // ========================================
        // Validate Uploaded File
        // ========================================

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "No PDF uploaded."

            });

        }


        // ========================================
        // Step 1: Extract Text
        // ========================================

        console.log(
            "Extracting PDF text..."
        );

        const extractedText =
            await documentLoader(
                req.file.path
            );


        // ========================================
        // Step 2: Clean Text
        // ========================================

        console.log(
            "Cleaning extracted text..."
        );

        const cleanedText =
            textCleaner(
                extractedText
            );


        // ========================================
        // Step 3: Chunk Text
        // ========================================

        console.log(
            "Creating chunks..."
        );

        const chunks =
            chunkService(
                cleanedText
            );

        console.log(
            "Total Chunks:",
            chunks.length
        );


        // ========================================
        // Step 4: Generate Embeddings
        // ========================================

        console.log(
            "Generating embeddings concurrently..."
        );

        const embeddings =
            await limitConcurrency(
                chunks,
                10,
                async (chunk) => {

                    return await generateEmbedding(
                        chunk
                    );

                }
            );

        console.log(
            "Total Embeddings:",
            embeddings.length
        );


        if (embeddings.length > 0) {

            console.log(
                "Embedding Dimension:",
                embeddings[0].length
            );

        }


        // ========================================
        // Step 5: Store Embeddings
        // ========================================

        storeEmbeddings(
            chunks,
            embeddings
        );

        console.log(
            "Embeddings Stored Successfully"
        );


        // ========================================
        // Step 6: Prepare LLM Batches
        // ========================================

        const allChunks =
            getAllChunks();


        /*
         * Smaller batches keep individual
         * Groq requests within token limits.
         */

        const batchSize = 4;

        const batches = [];


        for (
            let i = 0;
            i < allChunks.length;
            i += batchSize
        ) {

            const batch =
                allChunks
                    .slice(
                        i,
                        i + batchSize
                    )
                    .join("\n\n");

            batches.push(batch);
        }


        console.log(
            `Processing ${batches.length} summarization batches...`
        );


        // ========================================
        // Step 7: Analyze Batches
        // ========================================

        /*
         * Two batches are processed concurrently.
         *
         * This improves wall-clock time while
         * keeping concurrency controlled.
         *
         * Groq retry logic handles temporary
         * 429 rate-limit responses.
         */

        const partialSummaries =
            await limitConcurrency(
                batches,
                2,
                async (batch, index) => {

                    console.log(
                        `Analyzing Batch ${index + 1}/${batches.length}`
                    );

                    return await analyzeBatch(
                        batch
                    );

                }
            );


        console.log(
            "All batches analyzed successfully."
        );


        // ========================================
        // Step 8: Combine Partial Summaries
        // ========================================

        const finalContext =
            partialSummaries.join(
                "\n\n"
            );


        console.log(
            "Generating final analysis..."
        );


        // ========================================
        // Step 9: Final AI Analysis
        // ========================================

        const aiResult =
            await generateFinalAnalysis(
                finalContext
            );


        console.log(
            "Raw AI Response:"
        );

        console.log(
            aiResult
        );


        // ========================================
        // Step 10: Parse AI Response
        // ========================================

        let analysis;


        try {

            const cleanedResult =
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


            analysis =
                JSON.parse(
                    cleanedResult
                );


            // ====================================
            // Application-Level Risk Calculation
            // ====================================

            analysis.riskScore =
                calculateRisk(
                    analysis
                );


            console.log(
                "JSON Parsed Successfully"
            );

        }
        catch (parseError) {

            console.error(
                "JSON Parsing Failed"
            );

            console.error(
                parseError
            );


            analysis = {

                rawResponse:
                    aiResult

            };

        }


        // ========================================
        // Step 11: Save Analysis
        // ========================================

        await Analysis.create({

            fileName:
                req.file.originalname,

            documentType:
                analysis.documentType ||
                "Unknown",

            summary:
                analysis.summary ||
                "No Summary",

            riskScore:
                analysis.riskScore ||
                0,

            analysis

        });


        console.log(
            "Analysis Saved Successfully"
        );


        // ========================================
        // Step 12: Send Response
        // ========================================

        return res.status(200).json({

            success: true,

            message:
                "PDF Uploaded & Analyzed Successfully",


            file: {

                filename:
                    req.file.filename,

                originalName:
                    req.file.originalname,

                size:
                    req.file.size,

                path:
                    req.file.path

            },


            characters:
                cleanedText.length,


            chunks:
                chunks.length,


            embeddingDimension:
                embeddings.length > 0
                    ? embeddings[0].length
                    : 0,


            storedChunks:
                chunks.length,


            preview:
                cleanedText.substring(
                    0,
                    500
                ),


            analysis

        });

    }

    catch (error) {

        console.error(
            "Upload Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};