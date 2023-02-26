const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
		},
		postId: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		profilePicture: {
			type: String,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
