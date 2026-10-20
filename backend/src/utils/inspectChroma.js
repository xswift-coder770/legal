import { ChromaClient } from "chromadb";

const inspect = async () => {
    try {
        const client = new ChromaClient({ path: process.env.CHROMA_URL || "http://localhost:8000" });
        const collections = await client.listCollections();

        console.log("\n=======================================================");
        console.log("       🔍 CHROMA VECTOR DATABASE INSPECTION");
        console.log("=======================================================");
        console.log(`📁 Total Active Collections: ${collections.length}\n`);

        if (collections.length === 0) {
            console.log("No collections found yet. Upload a document to create one!");
            return;
        }

        for (const colInfo of collections) {
            const col = await client.getCollection({ name: colInfo.name });
            const count = await col.count();
            const data = await col.get({
                limit: 3,
                include: ["documents", "metadatas", "embeddings"],
            });

            console.log(`📌 Collection: ${colInfo.name}`);
            console.log(`   ├─ Total Chunks Stored: ${count}`);
            console.log(`   ├─ Metadata:`, colInfo.metadata || "None");

            if (data.documents && data.documents.length > 0) {
                console.log(`   ├─ Sample Chunks Preview:`);
                data.documents.forEach((doc, idx) => {
                    const preview = doc.length > 120 ? doc.substring(0, 120) + "..." : doc;
                    const dim = data.embeddings && data.embeddings[idx] ? data.embeddings[idx].length : "Stored";
                    console.log(`   │   [Chunk ${idx + 1}] (Vector Dim: ${dim})`);
                    console.log(`   │   "${preview.replace(/\n/g, ' ')}"`);
                });
            }
            console.log("-------------------------------------------------------");
        }
    } catch (error) {
        console.error("Error inspecting ChromaDB:", error.message);
        console.log("Tip: Ensure ChromaDB server is running on http://localhost:8000");
    }
};

inspect();
