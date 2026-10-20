import { getOrCreateCollection } from "../config/chroma.js";

// ============================================
// In-Memory Fallback Cache (Resilience Layer)
// Key: `${userId}_${docId}` -> { chunks, embeddings }
// ============================================
const memoryFallback = new Map();

/**
 * Cosine Similarity calculation for fallback vector search
 */
const cosineSimilarity = (vecA, vecB) => {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    return (!magA || !magB) ? 0 : dot / (magA * magB);
};

// ============================================
// Store Embeddings in ChromaDB (with Graceful Fallback)
// ============================================

export const storeEmbeddings = async (chunks, embeddings, userId, docId) => {
    if (!chunks || chunks.length === 0) {
        console.warn("storeEmbeddings: No chunks to store.");
        return;
    }

    // Always cache in isolated memory space
    const cacheKey = `${userId}_${docId}`;
    memoryFallback.set(cacheKey, { chunks, embeddings });

    try {
        const collection = await getOrCreateCollection(userId, docId);

        const existing = await collection.count();
        if (existing > 0) {
            console.log(`ChromaDB: Collection already has ${existing} docs — skipping re-embed.`);
            return;
        }

        const ids = chunks.map((_, i) => `chunk_${i + 1}`);
        const documents = chunks;
        const embeddingVectors = embeddings;
        const metadatas = chunks.map((_, i) => ({
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
    } catch (error) {
        console.warn(`⚠️ ChromaDB server offline/unreachable (${error.message}). Gracefully using isolated in-memory vector cache.`);
    }
};

// ============================================
// Search Relevant Chunks (ChromaDB + Fallback)
// ============================================

export const searchRelevantChunks = async (
    queryEmbedding,
    topK = 5,
    userId,
    docId
) => {
    // 1. Try ChromaDB first
    try {
        const collection = await getOrCreateCollection(userId, docId);
        const count = await collection.count();

        if (count > 0) {
            const results = await collection.query({
                queryEmbeddings: [queryEmbedding],
                nResults: Math.min(topK, count),
                include: ["documents", "distances", "metadatas"],
            });

            if (results?.documents?.[0]?.length > 0) {
                const docs = results.documents[0];
                const distances = results.distances[0];
                const ids = results.ids[0];

                return docs.map((text, i) => ({
                    id: ids[i],
                    text,
                    score: 1 - distances[i],
                }));
            }
        }
    } catch (chromaErr) {
        console.warn(`⚠️ Chroma query failed (${chromaErr.message}). Using memory fallback.`);
    }

    // 2. Fallback to in-memory search
    const cacheKey = `${userId}_${docId}`;
    const cached = memoryFallback.get(cacheKey);

    if (!cached || !cached.chunks || cached.chunks.length === 0) {
        return [];
    }

    const scores = cached.chunks.map((text, idx) => ({
        id: `chunk_${idx + 1}`,
        text,
        score: cosineSimilarity(queryEmbedding, cached.embeddings[idx]),
    }));

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, topK);
};

// ============================================
// Get All Chunks (ChromaDB + Fallback)
// ============================================

export const getAllChunks = async (userId, docId) => {
    try {
        const collection = await getOrCreateCollection(userId, docId);
        const count = await collection.count();

        if (count > 0) {
            const results = await collection.get({
                include: ["documents", "metadatas"],
            });

            const paired = results.documents.map((doc, i) => ({
                text: doc,
                index: results.metadatas[i]?.chunkIndex ?? i,
            }));

            paired.sort((a, b) => a.index - b.index);
            return paired.map(p => p.text);
        }
    } catch (err) {
        console.warn(`⚠️ Chroma getAllChunks failed (${err.message}). Using memory fallback.`);
    }

    const cacheKey = `${userId}_${docId}`;
    return memoryFallback.get(cacheKey)?.chunks || [];
};
