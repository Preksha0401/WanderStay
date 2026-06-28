let User=require("../Models/user.js");

module.exports.renderSigUP=(req,res)=>{
	res.render("users/signup.ejs");
};

module.exports.signUP=async(req,res)=>{
	try{
		let {username,email,password}=req.body;
		const newUser=new User({email,username});
		const registeredUser=await User.register(newUser,password);
		console.log(registeredUser);

		// without login directly sign up after enters without login
		req.login(registeredUser,(err)=>{
			if(err) {
				return next(err);
			}
			req.flash("success","Welcome to Wanderlust!");
			res.redirect("/listings");
		});
	}catch(e){
		req.flash("error",e.message);
		res.redirect("/signup");
	}
};

module.exports.renderLogin=(req,res)=>{
	res.render("users/login.ejs");
};

module.exports.login= async(req,res)=>{
	req.flash("success","Welcome to WanderStay! You are logged in");
	
	if(req.user.role==="admin"){
		return res.redirect("/admin/applications");
	}
	
	let redirectUrl=res.locals.redirectUrl || "/listings";
	res.redirect(redirectUrl);
};

module.exports.logout=(req,res)=>{
	req.logout((err)=>{
		if(err){
			return next(err);
		}
		req.flash("success","You are logged out!!");
		res.redirect("/listings");
	})
};