const express = require("express");
const router = express.Router();
const User = require("../Models/user");
const adminController=require("../controllers/admin");
const { isLoggedIn, isAdmin } = require("../middleware");

// Show pending applications
router.get("/applications",isLoggedIn,isAdmin, async(req,res)=>{
    const applications = await User.find({ownerStatus: "pending"});
	// console.log(applications);
    res.render("admin/applications.ejs", {applications});
});

// Analyze AI
router.post("/:id/analyze",isLoggedIn,isAdmin,adminController.analyzeHost,(req,res)=>{
	console.log("Analyze button clicked");
	console.log(req.params.id);

	res.send("Analyze Route working");
})

// Approve application
router.post("/:id/approve",isLoggedIn,isAdmin, async(req,res)=>{
	const user=await User.findById(req.params.id);
	user.role="owner";
	user.ownerStatus="verified";
	user.verifiedAt=new Date();
	await user.save();

	req.flash("success","Host approved successfully");
	res.redirect("/admin/applications");
});
router.post("/:id/reject",isLoggedIn,isAdmin, async (req, res) => {
    const user = await User.findById(req.params.id);

    user.ownerStatus = "rejected";

    await user.save();

    req.flash("success", "Host application rejected!");
    res.redirect("/admin/applications");
});
module.exports = router;