const { GoogleGenAI } = require("@google/genai");
const axios = require("axios");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function extractLicenseData(imageUrl) {
    try {
        console.log("🔍 Downloading license image:", imageUrl);

        // Download image from Cloudinary
        const image = await axios.get(imageUrl, {
            responseType: "arraybuffer",
        });

        // Get actual MIME type from Cloudinary response
        const mimeType =
            image.headers["content-type"] || "image/jpeg";

        console.log("📷 Image MIME type:", mimeType);

        const base64Image = Buffer.from(image.data).toString("base64");

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",

            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Image,
                            },
                        },
                        {
                            text: `
You are an OCR assistant.

Extract the following information from this business license.

Return ONLY valid JSON in exactly this structure:

{
    "businessName": "",
    "licenseNumber": "",
    "issueDate": "",
    "expiryDate": "",
    "address": ""
}

Rules:
- If any field is missing or cannot be read, return null.
- Do not guess information.
- Return only valid JSON.
- Do not use markdown.
- Do not include explanations.
                            `,
                        },
                    ],
                },
            ],
        });

        const result = response.text;

        console.log("🤖 Gemini Raw Response:");
        console.log(result);

        return result;

    } catch (err) {
        console.error("❌ Gemini Error:", err);
        throw err;
    }
}

module.exports = {
    extractLicenseData,
};
