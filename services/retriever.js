// retriever.js (complete updated file)
const { loadEmbeddingStore } = require('./vectorStore');

/**
 * Cosine Similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Retrieve top K relevant chunks with similarity scores
 */
async function retrieveRelevantChunks(query, k = 4) {
    try {
        // Load pre-computed embeddings
        const embeddingStore = loadEmbeddingStore();

        if (embeddingStore.length === 0) {
            console.warn("⚠️ Embedding store is empty");
            return [];
        }

        // Embed the query (ONE embedding only)
        const { getEmbeddings } = require('./embeddings');
        const queryEmbedding = (await getEmbeddings([query]))[0];

        // Calculate similarity scores
        const scoredChunks = embeddingStore.map(chunk => ({
            ...chunk,
            similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
        }));

        // Sort by similarity (descending)
        scoredChunks.sort((a, b) => b.similarity - a.similarity);

        const topK = scoredChunks.slice(0, k);

        // Beautiful logging
        console.log("\n" + "=".repeat(30));
        console.log("RAG Retrieval");
        console.log("=".repeat(30));
        console.log(`Query:\n${query}\n`);
        console.log("Top Chunks:\n");

        topK.forEach((chunk, index) => {
            const preview = chunk.pageContent.substring(0, 200) + 
                          (chunk.pageContent.length > 200 ? "..." : "");
            console.log(`${index + 1}.`);
            console.log(`Source: ${chunk.metadata.source}`);
            console.log(`Similarity: ${(chunk.similarity * 100).toFixed(2)}%`);
            console.log(`Content Preview: ${preview}`);
            console.log("-".repeat(40));
        });
        console.log("=".repeat(30) + "\n");

        return topK.map(item => ({
            pageContent: item.pageContent,
            metadata: item.metadata,
            similarity: item.similarity
        }));

    } catch (error) {
        console.error("Retriever Error:", error);
        return [];
    }
}

/**
 * Create semantic search query from license data
 */
function createSearchQuery(licenseData) {
    let query = "Verify this hotel business license: ";
    
    if (licenseData.businessName) query += `Business Name: ${licenseData.businessName}. `;
    if (licenseData.licenseNumber) query += `License Number: ${licenseData.licenseNumber}. `;
    if (licenseData.expiryDate) query += `Expiry Date: ${licenseData.expiryDate}. `;
    if (licenseData.issueDate) query += `Issue Date: ${licenseData.issueDate}. `;
    
    query += "Check validity, missing fields, expiry status, and compliance with hotel rules.";
    
    return query;
}

module.exports = {
    retrieveRelevantChunks,
    createSearchQuery
};