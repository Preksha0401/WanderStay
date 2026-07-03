const fs = require('fs');
const path = require('path');
const { loadAndChunkDocuments } = require('./chunker');
const { embedChunks } = require('./embeddings');

/**
 * Lightweight Vector Store using JSON + Gemini Embeddings
 */
const VECTOR_DB_PATH = path.join(__dirname, '../vectorDB/embeddings.json');

async function buildEmbeddingStore() {
    try {
        console.log("📚 Loading documents and creating chunks...");
        const chunks = await loadAndChunkDocuments();

        console.log("🔢 Generating embeddings...");
        const embeddedChunks = await embedChunks(chunks);

        // Save to JSON
        const dbDir = path.dirname(VECTOR_DB_PATH);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        fs.writeFileSync(VECTOR_DB_PATH, JSON.stringify(embeddedChunks, null, 2));

        console.log(`✅ Embedding store created successfully!`);
        console.log(`   Total chunks: ${embeddedChunks.length}`);
        console.log(`   Saved at: ${VECTOR_DB_PATH}`);

        return embeddedChunks;
    } catch (error) {
        console.error("❌ Failed to build embedding store:", error);
        throw error;
    }
}

function loadEmbeddingStore() {
    try {
        if (!fs.existsSync(VECTOR_DB_PATH)) {
            throw new Error("Embedding store not found. Run buildEmbeddingStore() first.");
        }
        const data = fs.readFileSync(VECTOR_DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Failed to load embedding store:", error);
        return [];
    }
}

module.exports = {
    buildEmbeddingStore,
    loadEmbeddingStore,
    VECTOR_DB_PATH
};