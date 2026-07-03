// rag.js (complete updated file)
const { GoogleGenAI } = require("@google/genai");
const { createSearchQuery, retrieveRelevantChunks } = require("./retriever");
const { RAG_PROMPT } = require("../utils/prompts");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Build formatted context from retrieved chunks
 */
function buildContext(chunks) {
    if (chunks.length === 0) {
        return "No relevant government rules were found.\nPerform best-effort verification.";
    }

    return chunks.map((chunk, i) => {
        const source = chunk.metadata?.source || `Rule ${i + 1}`;
        const preview = chunk.pageContent.length > 500 
            ? chunk.pageContent.substring(0, 500) + "..." 
            : chunk.pageContent;
        
        return `Rule ${i + 1}\n\nSource: ${source}\n\nContent:\n${preview}`;
    }).join("\n\n---------------------------------\n\n");
}

async function analyzeLicenseWithRules(licenseData) {
    try {
        console.log("🔍 Starting RAG Analysis...");

        const query = createSearchQuery(licenseData);
        const relevantChunks = await retrieveRelevantChunks(query, 4);

        const context = buildContext(relevantChunks);

        // Calculate average confidence
        const avgSimilarity = relevantChunks.length > 0 
            ? relevantChunks.reduce((sum, chunk) => sum + chunk.similarity, 0) / relevantChunks.length 
            : 0;

        const confidence = Math.round(avgSimilarity * 100);

        // Get retrieved rule sources
        const retrievedRules = relevantChunks.map(chunk => 
            chunk.metadata?.source || `Rule ${chunk.metadata?.index || ''}`
        );

        const prompt = `${RAG_PROMPT}

Government Rules:
${context}

License Data:
${JSON.stringify(licenseData, null, 2)}
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        let resultText = response.text || response.response?.text || "";
        resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();

        const recommendation = JSON.parse(resultText);

        // Add confidence and retrieved rules
        recommendation.confidence = confidence;
        recommendation.retrievedRules = retrievedRules;

        console.log("✅ RAG Complete");
        return recommendation;

    } catch (error) {
        console.error("RAG Failed:", error);
        return {
            status: "Manual Review",
            recommendation: "System Error",
            reason: error.message.substring(0, 100),
            confidence: 0,
            retrievedRules: []
        };
    }
}

module.exports = {
    analyzeLicenseWithRules
};