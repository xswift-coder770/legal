let vectorStore = [];

/**
 * Store all chunks with their embeddings
 */
export const storeEmbeddings = (chunks, embeddings) => {

    vectorStore = chunks.map((chunk, index) => ({
        id: index + 1,
        text: chunk,
        embedding: embeddings[index]
    }));

};

/**
 * Cosine Similarity
 */
const cosineSimilarity = (vecA, vecB) => {

    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < vecA.length; i++) {

        dot += vecA[i] * vecB[i];

        magA += vecA[i] * vecA[i];

        magB += vecB[i] * vecB[i];

    }

    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);

    if (magA === 0 || magB === 0) {
        return 0;
    }

    return dot / (magA * magB);

};

/**
 * Search Top K Relevant Chunks
 */
export const searchRelevantChunks = (
    queryEmbedding,
    topK = 5
) => {

   const scores = vectorStore.map(item => ({

    id: item.id,

    text: item.text,

    score: cosineSimilarity(
        queryEmbedding,
        item.embedding
    )

}));

    scores.sort((a, b) => b.score - a.score);

    return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
};

/**
 * Get All Stored Chunks
 */
export const getAllChunks = () => {

    return vectorStore.map(item => item.text);

};