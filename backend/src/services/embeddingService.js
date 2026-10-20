import { pipeline, env } from "@xenova/transformers";

// Optimized settings for low-memory container environments
env.allowLocalModels = false;
env.useBrowserCache = false;

let modelPromise = null;

const loadModel = () => {
    if (!modelPromise) {
        console.log("Loading embedding model (singleton)...");
        modelPromise = pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2",
            { quantized: true }
        )
            .then((model) => {
                console.log("✅ Embedding model loaded into memory (single instance).");
                return model;
            })
            .catch((err) => {
                modelPromise = null; // Reset so retry is possible if download failed
                throw err;
            });
    }

    return modelPromise;
};

const generateEmbedding = async (text) => {
    const model = await loadModel();

    const output = await model(text, {
        pooling: "mean",
        normalize: true,
    });

    return Array.from(output.data);
};

export default generateEmbedding;
