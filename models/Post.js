const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			max: 2000,
		},
		media: {
			type: String,
		},
		likes: {
			type: Array,
			default: [],
		},
		dislikes: {
			type: Array,
			default: [],
		},
		comments: {
			type: Array,
			defualt: [],
		},
		isPrivate: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
