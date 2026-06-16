const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync")
const Listing =require("../Models/listing");
const {isLoggedIn,isOwner,validateListing, isVerifiedHost}=require("../middleware.js");
const listingController=require("../controllers/listing");
const multer  = require('multer');
const{storage}=require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
	.get(wrapAsync(listingController.index))
	.post(isLoggedIn,isVerifiedHost,upload.single('listing[image]'),validateListing,wrapAsync(listingController.afterFormSubmission));
	

// create new
router.get("/new",isLoggedIn,isVerifiedHost,listingController.renderNewForm);


router.route("/:id")
	.get(wrapAsync(listingController.showRoute))
	.put( isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.saveEdit))
	.delete(isLoggedIn,isOwner,wrapAsync(listingController.delete));

// for editing
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.editForm));

// Index Routing
// router.get("/", wrapAsync(listingController.index));

// show route
// router.get("/:id",wrapAsync(listingController.showRoute));

// after submitting the form
// router.post("/",isLoggedIn,validateListing,wrapAsync(listingController.afterFormSubmission));

// save the edit
// router.put("/:id", isLoggedIn,isOwner,validateListing,wrapAsync(listingController.saveEdit));

// Delete
// router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.delete));

module.exports=router;
