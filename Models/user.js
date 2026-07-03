const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ["user", "owner", "admin"],
    default: "user"
  },

  ownerStatus: {
    type: String,
    enum: ["none", "pending", "verified", "rejected"],
    default: "none"
  },
  appliedAt: {
    type: Date
  },

  verifiedAt: {
    type: Date
  },license: {
    url: String,
    filename: String,
  },
  licenseData: {
    businessName: String,
    licenseNumber: String,
    issueDate: String,
    expiryDate: String,
    address: String,
    extractedAt: Date,
  },
  aiAnalysis:{
    status:String,
    recommendation: String,
    reason:String,
    confidence: Number,
    retrievedRules: [String],
    analyzedAt:Date
  }
});

// THIS MUST BE A FUNCTION
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
