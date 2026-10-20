import { getOrCreateCollection } from "../config/chroma.js";

// ============================================
// Store Embeddings in ChromaDB
// ============================================

/**
 * Store text chunks + their embeddings in a user-scoped ChromaDB collection.
 * Skips storage if the collection already has documents (avoids re-embedding).
 *
 * @param {string[]} chunks     - Array of text chunks
 * @param {number[][]} embeddings - Parallel array of embedding vectors
 * @param {string} userId       - Authenticated user's MongoDB _id
 * @param {string} docId        - Analysis document _id (used to scope collection)
 */
export const storeEmbeddings = async (chunks, embeddings, userId, docId) => {

    if (!chunks || chunks.length === 0) {
        console.warn("storeEmbeddings: No chunks to store.");
        return;
    }

    const collection = await getOrCreateCollection(userId, docId);

    // ----------------------------------------
    // Check if already embedded — avoid duplicates
    // ----------------------------------------

    const existing = await collection.count();

    if (existing > 0) {
        console.log(`ChromaDB: Collection already has ${existing} docs — skipping re-embed.`);
        return;
    }

    // ----------------------------------------
    // Build ChromaDB-compatible payload
    // ----------------------------------------

    const ids         = chunks.map((_, i) => `chunk_${i + 1}`);
    const documents   = chunks;
    const embeddingVectors = embeddings;
    const metadatas   = chunks.map((_, i) => ({
        chunkIndex: i,
        userId,
        docId,
    }));

    await collection.add({
        ids,
        documents,
        embeddings: embeddingVectors,
        metadatas,
    });

    console.log(`✅ ChromaDB: Stored ${chunks.length} embeddings for user=${userId} doc=${docId}`);

};

// ============================================
// Search Relevant Chunks from ChromaDB
// ============================================

/**
 * Query ChromaDB for the top-K most similar chunks to the query embedding.
 * Only searches within the user+doc scoped collection.
 *
 * @param {number[]} queryEmbedding - Embedding vector of the question
 * @param {number}   topK           - Number of results to return
 * @param {string}   userId         - Authenticated user's MongoDB _id
 * @param {string}   docId          - Analysis document _id
 * @returns {Promise<Array<{id, text, score}>>}
 */
export const searchRelevantChunks = async (
    queryEmbedding,
    topK = 5,
    userId,
    docId
) => {

    const collection = await getOrCreateCollection(userId, docId);

    const count = await collection.count();

    if (count === 0) {
        console.warn("ChromaDB: Collection is empty — no chunks to search.");
        return [];
    }

    const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: Math.min(topK, count),
        include: ["documents", "distances", "metadatas"],
    });

    if (
        !results ||
        !results.documents ||
        !results.documents[0] ||
        results.documents[0].length === 0
    ) {
        return [];
    }

    // ChromaDB returns distances (lower = more similar).
    // Convert to similarity score (1 - normalized_distance).
    const docs      = results.documents[0];
    const distances = results.distances[0];
    const ids       = results.ids[0];

    return docs.map((text, i) => ({
        id:    ids[i],
        text,
        score: 1 - distances[i], // cosine distance → similarity
    }));

};

// ============================================
// Get All Chunks for Batch Analysis
// ============================================

/**
 * Retrieve all stored chunks from a user+doc ChromaDB collection.
 * Used during the initial batch analysis step in uploadController.
 *
 * @param {string} userId
 * @param {string} docId
 * @returns {Promise<string[]>}
 */
export const getAllChunks = async (userId, docId) => {

    const collection = await getOrCreateCollection(userId, docId);

    const count = await collection.count();

    if (count === 0) return [];

    const results = await collection.get({
        include: ["documents", "metadatas"],
    });

    // Sort by chunkIndex to maintain original document order
    const paired = results.documents.map((doc, i) => ({
        text:  doc,
        index: results.metadatas[i]?.chunkIndex ?? i,
    }));

    paired.sort((a, b) => a.index - b.index);

    return paired.map(p => p.text);

};