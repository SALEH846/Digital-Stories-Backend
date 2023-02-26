const router = require("express").Router();
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");

// add a new comment
router.post("/", async (request, response) => {
	const newComment = new Comment(request.body);
	try {
		const post = await Post.findById(request.body.postId);
		const user = await User.findById(request.body.userId);
		const comment = await newComment.save();
		if (!user.engagement.includes(post._id)) {
			await user.updateOne({ $push: { engagement: post._id } });
		}
		await post.updateOne({ $push: { comments: comment._id } });
		const postAgain = await Post.findById(request.body.postId);
		// console.log(comment._id);
		const allComments = await Promise.all(
			postAgain.comments.map((commentId) => {
				return Comment.findById(commentId);
			})
		);
		// console.log(allComments);
		return response.status(200).json(allComments);
	} catch (error) {
		return response.status(500).json(error);
	}
});

// get all comments for a post
router.get("/:postId", async (request, response) => {
	try {
		const post = await Post.findById(request.params.postId);
		const comments = await Promise.all(
			post.comments.map((commentId) => {
				return Comment.findById(commentId);
			})
		);
		return response.status(200).json(comments);
	} catch (error) {
		return response.status(500).json(error);
	}
});

module.exports = router;
