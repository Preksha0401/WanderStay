const Listing=require("../Models/listing");
const { listingSchema } = require("../schema");
const axios=require("axios");

module.exports.index=async (req, res) => {
		const listings = await Listing.find({});
    	res.render("listings/index.ejs", { listings });  // pass the listings to the template    
};

module.exports.renderNewForm=(req,res)=>{
	console.log(req.user);
	res.render("listings/new.ejs");
};


module.exports.showRoute=async(req,res)=>{
	let {id}=req.params;

	const read=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
	
	// if not listing
	if(!read){
	req.flash("error","Listing you requested does not existed");
	return res.redirect("/listings");
	}	console.log(read);
	res.render("listings/show.ejs",{read});
};


module.exports.afterFormSubmission=async(req,res)=>{
	// location
	let { title, description, price, location, country } = req.body.listing;

    const locationQuer = `${location}, ${country}`;
    const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: locationQuer, format: "json", limit: 1 },
        headers: { "User-Agent": "WanderStay-App" },
    });

    let lat = 19.076;
    let lng = 72.8777;
    if (geoRes.data.length > 0) {
        lat = parseFloat(geoRes.data[0].lat);
        lng = parseFloat(geoRes.data[0].lon);
    }

    let url = req.file.path;
    let filename = req.file.filename;

    const newList = new Listing({
        title,
        description,
        image: { url, filename },
        price,
        location,
        country,
        geometry: {
            type: "Point",
            coordinates: [lng, lat],   // ✅ GeoJSON format: [lng, lat]
        },
    });

    newList.owner = req.user._id;
    await newList.save();

    req.flash("success", "New Listing created!");
    return res.redirect("/listings");
};
// 	const locationQuer=`${req.body.location},${req.body.country}`;
// 	const geoRes= await axios.get(
// 		"https://nominatim.openstreetmap.org/search",
// 		{
// 			params:{
// 				q:locationQuer,
// 				format:"json",
// 				limit:1
// 			},
// 			headers:{
// 				"User-Agent":"WanderStay-App"
// 			}
// 		}
// 	);
// 	let lat=19.0760;
// 	let lng=72.8777;
// 	if(geoRes.data.length>0){
// 		lat=geoRes.data[0].lat;
// 		lng=geoRes.data[0].lon;
// 	}
// 	// image
// 	let url=req.file.path;
// 	let filename=req.file.filename;
// 	console.log(url,"..",filename);
	
// // 	let result=listingSchema.validate(req.body);
// // 	console.log(result);
// // if(result.error){
// // 	throw new ExpressError(400,result.error);
// // } 
// 	let {title,description,image,price,location,country}=req.body;
// 	const imageUrl =
// 	image === "" || !image
// 	  ? "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1170&auto=format&fit=crop"
// 	  : image;
	
// 	const newList = new Listing({
// 	title,
// 	description,
// 	image: {
// 	  url: imageUrl,
// 	  filename: "placeholder" // or leave empty if you're not using Cloudinary
// 	},
// 	price,
// 	location,
// 	country,
// 	geometry:{
// 		lat,lng
// 	}
//   });
//   console.log(newList.geometry);
//   	newList.owner=req.user._id;
// 	newList.image={url,filename};
// 	console.log(req.user); //owner's id
// 	await newList.save()
// 	req.flash("success","New Listing created!");
// 	console.log("List was saved");
// 	return res.redirect("/listings");
// };

module.exports.editForm=async(req,res)=>{
	let {id}=req.params;
	const findList=await Listing.findById(id);
	console.log(findList); // 👈 Add this line

	if(!findList){
		req.flash("error","The requested listing does not exist!");
		return res.redirect("/listings");
	}

	let originalImg=findList.image.url;
	originalImg=originalImg.replace("/upload","/upload/h_300,w_250");
	res.render("listings/edit.ejs",{findList,originalImg});
};

module.exports.saveEdit = async (req, res) => {
    let { id } = req.params;

    // ✅ Single update using req.body.listing
    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    );

    if (typeof req.file !== "undefined") {
        listing.image = { url: req.file.path, filename: req.file.filename };
        await listing.save();
    }

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
};
// module.exports.saveEdit=async (req,res)=>{

// 	let {id}=req.params;
// 	let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});

// // 	const imageUrl =
// // 	req.body.image === "" || !req.body.image
// // //	  ? "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1170&auto=format&fit=crop"
// // 	  : req.body.image;

// // 	if(!listing.owner._id.equals(res.locals.currUser._id)){
// // 		req.flash("error","You don't have pemission to edit");
// // 		return res.redirect(`/listings/${id}`);
// // 	}

// 	await Listing.findByIdAndUpdate(id, {
//   title: req.body.title,
//   description: req.body.description,
// 	  price: req.body.price,
//   location: req.body.location,
//   country: req.body.country
// });

// 	if(typeof req.file!=="undefined"){
// 		let url=req.file.path;
// 		let filename=req.file.filename;
// 		listing.image={url,filename};
// 		await listing.save();
// 	}

// 	req.flash("success","Listing updated!");
// 	res.redirect(`/listings/${id}`);
// };

// module.exports.delete=async (req,res)=>{
// 	let {id}=req.params;
// 	let deleted= await Listing.findByIdAndDelete(id,{...req.body.Listing});
// 	console.log(deleted);
// 	req.flash("success","Listing deleted!");
// 	return res.redirect("/listings");

// };
module.exports.delete = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);  // ✅ No second argument needed
    req.flash("success", "Listing deleted!");
    return res.redirect("/listings");
};