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
            let apiKey = process.env.CHROMA_API_KEY.trim();
            // Automatically extract the raw API key if the user pasted the entire code snippet
            const keyMatch = apiKey.match(/ck-[a-zA-Z0-9_-]+/);
            if (keyMatch) {
                apiKey = keyMatch[0];
            }

            // Extract and sanitize database name
            let database = (process.env.CHROMA_DATABASE || "").trim();
            const dbMatch = database.match(/database:\s*['"]?([a-zA-Z0-9_-]+)['"]?/);
            if (dbMatch) {
                database = dbMatch[1];
            } else {
                database = database.replace(/[^a-zA-Z0-9_-]/g, "");
            }
            if (!database) {
                database = "legal_policy";
            }

            // Extract and sanitize tenant UUID
            let tenant = (process.env.CHROMA_TENANT || "").trim();
            const tenantMatch = tenant.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
            if (tenantMatch) {
                tenant = tenantMatch[0];
            } else {
                tenant = tenant.replace(/[^a-zA-Z0-9_-]/g, "") || undefined;
            }

            console.log(`☁️ Chroma Cloud client initialized — database: ${database}, tenant: ${tenant || "default"}`);
            chromaClient = new CloudClient({
                apiKey,
                database,
                tenant,
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
