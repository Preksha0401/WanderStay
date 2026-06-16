const express = require("express");
const router = express.Router();
const User =require("../Models/user");
const { isLoggedIn } = require("../middleware");
const multer=require("multer");
const {storage}=require("../cloudConfig");
const upload=multer({storage});

// GET - Show Become a Host page
router.get("/apply",isLoggedIn, (req, res) => {
    res.render("host/apply.ejs");
});

// POST - Receive Host Application Data
router.post("/apply", isLoggedIn,upload.single("license"), async(req, res) => {

    console.log("Before Save:", req.user);
    console.log(req.file);
    console.log(req.body);

    const currUser = req.user;
    currUser.ownerStatus = "pending";   
    currUser.appliedAt = new Date();

    if(req.file){
        currUser.license={
            url:req.file.path,
            filename:req.file.filename,
        };
    }
    await currUser.save();
    console.log("After Save:", currUser);

    req.flash("success", "Host application submitted!");
    res.redirect("/listings");
});

module.exports = router;