const User = require("../Models/user");
const { extractLicenseData } = require("../services/gemini");
const { analyzeLicenseWithRules } = require("../services/rag");

module.exports.analyzeHost = async (req, res) => {

    try {

        console.log("Inside Admin Controller");

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).send("User not found");
        }

        if (!user.license || !user.license.url) {
            return res.status(400).send("License not uploaded");
        }

        // Step 1: Extract data using Gemini Vision (OCR)
        const result = await extractLicenseData(user.license.url);
        console.log("OCR Result:", result);
        
        let cleanResult = result
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        
        const data = JSON.parse(cleanResult);

        user.licenseData = {
            ...data,
            extractedAt: new Date()
        };

        await user.save();

        // ====================
        // OCR COMPLETE
        // ====================
        console.log("\n" + "=".repeat(20));
        console.log("OCR COMPLETE");
        console.log("=".repeat(20));
        console.log(`Business Name: ${data.businessName || 'N/A'}`);
        console.log(`License Number: ${data.licenseNumber || 'N/A'}`);
        console.log(`Expiry: ${data.expiryDate || 'N/A'}`);
        console.log(`Issue Date: ${data.issueDate || 'N/A'}`);
        console.log("=".repeat(20) + "\n");

        // ----------------------
        // Step 2: Advanced RAG Analysis
        // ----------------------
        console.log("\n" + "=".repeat(20));
        console.log("RUNNING RAG");
        console.log("=".repeat(20));

        let aiResult;
        try {
            aiResult = await analyzeLicenseWithRules(user.licenseData);
            
            // ====================
            // FINAL DECISION
            // ====================
            console.log("\n" + "=".repeat(20));
            console.log("FINAL DECISION");
            console.log("=".repeat(20));
            console.log(`Status: ${aiResult.status}`);
            console.log(`Recommendation: ${aiResult.recommendation}`);
            console.log(`Reason: ${aiResult.reason}`);
            console.log("=".repeat(20) + "\n");

            user.aiAnalysis = {
                ...aiResult,
                analyzedAt: new Date()
            };

            await user.save();
            console.log("✅ AI Analysis saved to MongoDB");
        } catch (ragErr) {
            console.error("RAG Error:", ragErr);
            user.aiAnalysis = { 
                status: "Manual Review", 
                recommendation: "Analysis Failed", 
                reason: ragErr.message.substring(0, 150),
                analyzedAt: new Date()
            };
            await user.save();
        }

        req.flash("success", "License analyzed successfully using Vector RAG!");
        res.redirect("/admin/applications");

    } } catch (err) {
    console.error("❌ ADMIN ANALYSIS ERROR:", err);
    console.error("Error message:", err.message);
    console.error("Stack:", err.stack);

    res.status(500).send(`AI Extraction Failed: ${err.message}`);
}

};
