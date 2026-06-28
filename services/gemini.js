const {GoogleGenAI}=require("@google/genai");

// create gemini client
const ai=new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY,
});

// fn which will analyze a license image
async function extractLicenseData(imageUrl) {
	const response=await ai.models.generateContent({
		model:"gemini-2.5-flash",
		contents:[{
			text:"Say Hello"
		}]
	});
	console.log(response.text);
	return response.text;
}

module.exports={
	extractLicenseData,
}

