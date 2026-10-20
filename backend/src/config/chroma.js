import { ChromaClient, CloudClient } from "chromadb";

// ============================================
// ChromaDB Client — Singleton
// ============================================

let chromaClient = null;

/**
 * Get or create the singleton ChromaDB client.
 * Automatically uses CloudClient when CHROMA_API_KEY is provided,
 * otherwise connects to local Chroma server (default: http://localhost:8000).
 */
export const getChromaClient = () => {

    if (!chromaClient) {

        if (process.env.CHROMA_API_KEY) {
            const database = process.env.CHROMA_DATABASE || "legal_policy";
            console.log(`☁️ Chroma Cloud client initialized — database: ${database}`);
            chromaClient = new CloudClient({
                apiKey: process.env.CHROMA_API_KEY,
                database,
                tenant: process.env.CHROMA_TENANT || undefined,
            });
        } else {
            const rawUrl = process.env.CHROMA_URL || process.env.CHROMA_DB_PATH || "http://localhost:8000";
            try {
                const parsed = new URL(rawUrl);
                chromaClient = new ChromaClient({
                    host: parsed.hostname || "localhost",
                    port: parseInt(parsed.port || "8000", 10),
                    ssl: parsed.protocol === "https:",
                });
            } catch {
                chromaClient = new ChromaClient({ path: rawUrl });
            }

            console.log(`✅ ChromaDB client initialized — ${rawUrl}`);
        }

    }

    return chromaClient;

};

// ============================================
// Collection Name Helper
// ============================================

/**
 * Generate a scoped ChromaDB collection name.
 * Pattern: legal_{userId}_{docId}
 *
 * ChromaDB collection names must:
 *  - Be 3–63 characters
 *  - Start and end with alphanumeric
 *  - Contain only alphanumeric, underscore, hyphen
 *
 * We sanitize userId and docId to meet these constraints.
 */
export const buildCollectionName = (userId, docId) => {

    const safeUserId = String(userId).replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
    const safeDocId  = String(docId).replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);

    return `legal_${safeUserId}_${safeDocId}`;

};

// ============================================
// Get or Create User-Scoped Collection
// ============================================

/**
 * Returns a ChromaDB collection scoped to a specific user + document.
 * Creates the collection if it doesn't exist yet.
 *
 * @param {string} userId - MongoDB User _id string
 * @param {string} docId  - Unique document identifier (Analysis _id or timestamp)
 * @returns {Promise<Collection>}
 */
const noopEmbeddingFunction = {
    generate: async (texts) => texts.map(() => [])
};

export const getOrCreateCollection = async (userId, docId) => {

    const client = getChromaClient();
    const name   = buildCollectionName(userId, docId);

    const collection = await client.getOrCreateCollection({
        name,
        embeddingFunction: noopEmbeddingFunction,
        metadata: {
            userId,
            docId,
            createdAt: new Date().toISOString(),
        },
    });

    return collection;

};

/**
 * Delete a user+document collection (used when deleting analysis history).
 *
 * @param {string} userId
 * @param {string} docId
 */
export const deleteCollection = async (userId, docId) => {

    try {

        const client = getChromaClient();
        const name   = buildCollectionName(userId, docId);

        await client.deleteCollection({ name });

        console.log(`🗑️  ChromaDB collection deleted: ${name}`);

    } catch (err) {

        // Collection may not exist — not an error
        console.warn(`ChromaDB deleteCollection warning: ${err.message}`);

    }

};
