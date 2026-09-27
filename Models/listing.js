const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./reviews.js");
const reviews = require("./reviews.js");


const listingSchema=new Schema({
	title:{
		type:String,
		required:true
	},
	description:String,
	image: {
  		url: String,
  		filename: String
	},
	price:Number,
	location:String,
	country:String,

	reviews:[
		{
		type:Schema.Types.ObjectId,
		ref:"Review",
		},
	],
	owner:{
		type: Schema.Types.ObjectId,
		ref:"User",
	},
	geometry: {
	    type: {
	        type: String,
	        enum: ["Point"],
	        required: true
	    },
	    coordinates: {
	        type: [Number],
	        required: true
	    }
	}
});


// delete reviews whose listing ke andar reviews aate hai
listingSchema.post("findOneAndDelete",async(listing)=>{
	if(listing){
	await Review.deleteMany({_id:{$in: listing.reviews}})
	}
});

// creating a model/collection
const Listing=mongoose.model("Listing",listingSchema);
// model ko export karengr with application.js
module.exports=Listing;
