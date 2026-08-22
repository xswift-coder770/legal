import { MemoryVectorStore } from "langchain/vectorstores/memory";

let vectorStore = null;

export const createVectorStore = async (embeddings) => {

    vectorStore = await MemoryVectorStore.fromDocuments(
        [],
        embeddings
    );

    return vectorStore;
};

export const getVectorStore = () => {

    return vectorStore;

};