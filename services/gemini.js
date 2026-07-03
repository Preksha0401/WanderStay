const { GoogleGenAI } = require("@google/genai");
const axios = require("axios");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function extractLicenseData(imageUrl) {
    try {

        // Download image from Cloudinary
        const image = await axios.get(imageUrl, {
            responseType: "arraybuffer",
        });

        const base64Image = Buffer.from(image.data).toString("base64");

        const response = await ai.models.generateContent({

            model: "gemini-2.5-flash",

            contents: [
                {
                    inlineData: {
                        mimeType: "image/png",
                        data: base64Image,
                    },
                },

                {
				text: `
				You are an OCR assistant.

				Extract the following information from this business license.

				Return ONLY valid JSON.

				{
				"businessName": "",
				"licenseNumber": "",
				"issueDate": "",
				"expiryDate": "",
				"address": ""
				}

				Rules:
				- If any field is missing, return null.
				- Return only JSON.
				- No markdown.
				- No explanation.
				`,
                },
            ],
        });

        return response.text;

    } catch (err) {
        console.error("Gemini Error:", err);
        throw err;
    }
}

module.exports = {
    extractLicenseData,
};