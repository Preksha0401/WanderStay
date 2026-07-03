const fs = require('fs');
const path = require('path');

/**
 * Simple but effective document chunker for RAG
 * Splits text into overlapping chunks suitable for embeddings
 */
function chunkDocument(text, sourceFile) {
    // Split by paragraphs or double newlines
    const paragraphs = text.split(/\n\s*\n/);
    
    const chunks = [];
    const chunkSize = 400;        // characters
    const chunkOverlap = 50;

    let currentChunk = '';

    for (let para of paragraphs) {
        para = para.trim();
        if (!para) continue;

        if (currentChunk.length + para.length > chunkSize) {
            if (currentChunk.length > 0) {
                chunks.push({
                    pageContent: currentChunk.trim(),
                    metadata: {
                        source: sourceFile,
                        chunkIndex: chunks.length
                    }
                });
            }
            // Start new chunk with overlap
            currentChunk = currentChunk.slice(-chunkOverlap) + ' ' + para;
        } else {
            currentChunk += (currentChunk ? ' ' : '') + para;
        }
    }

    // Push the last chunk
    if (currentChunk.trim()) {
        chunks.push({
            pageContent: currentChunk.trim(),
            metadata: {
                source: sourceFile,
                chunkIndex: chunks.length
            }
        });
    }

    return chunks;
}

/**
 * Load all documents and chunk them
 */
async function loadAndChunkDocuments() {
    const documentsDir = path.join(__dirname, '../documents');
    const files = fs.readdirSync(documentsDir).filter(f => f.endsWith('.txt'));
    
    let allChunks = [];

    for (let file of files) {
        const filePath = path.join(documentsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const chunks = chunkDocument(content, file);
        allChunks = allChunks.concat(chunks);
        
        console.log(`✅ Chunked ${file} into ${chunks.length} chunks`);
    }

    console.log(`Total chunks created: ${allChunks.length}`);
    return allChunks;
}

module.exports = {
    chunkDocument,
    loadAndChunkDocuments
};