require('dotenv').config();   // ← Add this line at the very top

const { buildEmbeddingStore } = require('./services/vectorStore');

async function init() {
    try {
        await buildEmbeddingStore();
        console.log("🎉 Vector Store Ready!");
    } catch (e) {
        console.error("Init failed", e);
    }
}

init();