const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			min: 3,
			max: 20,
			unique: true,
		},
		fullname: {
			type: String,
		},
		email: {
			type: String,
			required: true,
			max: 50,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			min: 8,
		},
		profilePicture: {
			type: String,
			default: "",
		},
		followers: {
			type: Array,
			default: [],
		},
		followings: {
			type: Array,
			default: [],
		},
		description: {
			type: String,
			max: 50,
		},
		engagement: {
			type: Array,
			default: [],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
