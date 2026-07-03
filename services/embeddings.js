const axios = require("axios");

/**
 * Direct Google Gemini Embedding API (REST) - Most Reliable
 */
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function getEmbeddings(texts) {
    const embeddings = [];

    for (const text of texts) {
        const response = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: text,
        });

        embeddings.push(response.embeddings[0].values);
    }

    return embeddings;
}

async function embedChunks(chunks) {
    const texts = chunks.map(chunk => chunk.pageContent);
    const embeddings = await getEmbeddings(texts);

    return chunks.map((chunk, index) => ({
        ...chunk,
        embedding: embeddings[index]
    }));
}

module.exports = {
    getEmbeddings,
    embedChunks
};