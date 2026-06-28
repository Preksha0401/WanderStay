// we r going to find the userid for analysing the license

const User=require("../Models/user");
const {extractLicenseData}=require("../services/gemini");

module.exports.analyzeHost=async (req,res)=>{
	console.log("Inside Admin Controller");
	const user=await User.findById(req.params.id);
	console.log(user.license.url);
	
	const result=await extractLicenseData(user.license.url);
	console.log(result);
	res.send("User Found successfully");
}