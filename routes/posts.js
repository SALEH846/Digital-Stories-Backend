const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");

// create a post
router.post("/", async (request, response) => {
	const newPost = new Post(request.body);
	try {
		const savedPost = await newPost.save();
		return response.status(200).json(savedPost);
	} catch (error) {
		return response
			.status(500)
			.json({ error: "Story not created. Internal server error!" });
	}
});

// update a post
router.put("/:id", async (request, response) => {
	try {
		const post = await Post.findById(request.params.id);
		if (post.userId === request.body.userId) {
			await post.updateOne({ $set: request.body });
			return response
				.status(200)
				.json({ message: "The post has been updated" });
		} else {
			return response.status(403).json({
				error: "You can update only the posts which are owned by you",
			});
		}
	} catch (error) {
		return response.status(500).json({ error: "Internal server error" });
	}
});

// delete a post
router.delete("/:id", async (request, response) => {
	try {
		const post = await Post.findById(request.params.id);
		// console.log(post);
		// console.log(post.userId);
		// console.log(request.body);
		if (post.userId === request.body.userId) {
			await post.deleteOne();
			return response
				.status(200)
				.json({ message: "The post has been deleted" });
		} else {
			return response.status(403).json({
				error: "You can delete only the posts which are owned by you",
			});
		}
	} catch (error) {
		return response.status(500).json({ error: "Internal server error!" });
	}
});

// upvote a post
router.put("/:id/like", async (request, response) => {
	try {
		const post = await Post.findById(request.params.id);
		const comments = await Comment.find({
			userId: request.body.userId,
			postId: post._id,
		});
		const user = await User.findById(request.body.userId);
		if (!post.likes.includes(request.body.userId)) {
			if (!post.dislikes.includes(request.body.userId)) {
				await post.updateOne({ $push: { likes: request.body.userId } });
				if (!user.engagement.includes(post._id)) {
					await user.updateOne({ $push: { engagement: post._id } });
				}
			} else {
				await post.updateOne({ $pull: { dislikes: request.body.userId } });
				await post.updateOne({ $push: { likes: request.body.userId } });
			}
			return response.status(200).json("The post has been liked");
		} else {
			await post.updateOne({ $pull: { likes: request.body.userId } });
			if (comments.length === 0) {
				await user.updateOne({ $pull: { engagement: post._id } });
			}
			return response.status(200).json("The post has been unliked");
		}
	} catch (error) {
		return response.status(500).json(error);
	}
});

// dislike and remove dislike from a post
router.put("/:id/dislike", async (request, response) => {
	try {
		const post = await Post.findById(request.params.id);
		const comments = await Comment.find({
			userId: request.body.userId,
			postId: post._id,
		});
		const user = await User.findById(request.body.userId);
		if (!post.dislikes.includes(request.body.userId)) {
			if (!post.likes.includes(request.body.userId)) {
				await post.updateOne({ $push: { dislikes: request.body.userId } });
				if (!user.engagement.includes(post._id)) {
					await post.updateOne({ $push: { engagement: post._id } });
				}
			} else {
				await post.updateOne({ $pull: { likes: request.body.userId } });
				await post.updateOne({ $push: { dislikes: request.body.userId } });
			}
			return response.status(200).json("The post has been downvoted");
		} else {
			await post.updateOne({ $pull: { dislikes: request.body.userId } });
			if (comments.length === 0) {
				await user.updateOne({ $pull: { engagement: post._id } });
			}
			return response.status(200).json("The downvote of post has been removed");
		}
	} catch (error) {
		return response.status(500).json(error);
	}
});

// get a post
router.get("/:id", async (request, response) => {
	try {
		const post = await Post.findById(request.params.id);
		return response.status(200).json(post);
	} catch (error) {
		return response.status(500).json(error);
	}
});

// get timeline posts
router.get("/timeline/:userId", async (request, response) => {
	try {
		const currentUser = await User.findById(request.params.userId);
		const userPosts = await Post.find({ userId: currentUser._id });
		const friendPosts = await Promise.all(
			currentUser.followings.map((friendId) => {
				return Post.find({ userId: friendId });
			})
		);
		return response
			.status(200)
			.json({ data: userPosts.concat(...friendPosts) });
	} catch (error) {
		return response.status(500).json(error);
	}
});

// get individual user's all posts
router.get("/profile/all/:username", async (request, response) => {
	try {
		const user = await User.findOne({ username: request.params.username });
		const posts = await Post.find({ userId: user._id });
		return response.status(200).json({ data: posts });
	} catch (error) {
		return response.status(500).json(error);
	}
});

// get individual user's all public posts
router.get("/profile/:username", async (request, response) => {
	try {
		const user = await User.findOne({ username: request.params.username });
		let posts = await Post.find({ userId: user._id });
		posts = posts.filter((post) => post.isPrivate === false);
		return response.status(200).json({ data: posts });
	} catch (error) {
		return response.status(500).json(error);
	}
});

// make a private post, public
router.post("/public/:postId", async (request, response) => {
	try {
		const post = await Post.findById(request.params.postId);
		if (post.isPrivate === true) {
			await post.updateOne({ $set: { isPrivate: false } });
			const updatedPost = await Post.findById(request.params.postId);
			return response
				.status(200)
				.json({ data: updatedPost, message: "The story has been made public" });
		} else {
			return response
				.status(400)
				.json({ error: "This story is already public" });
		}
	} catch (error) {
		return response.status(500).json({ error: "Internal server error!" });
	}
});

// make a public post, private
router.post("/private/:postId", async (request, response) => {
	try {
		const post = await Post.findById(request.params.postId);
		if (post.isPrivate === false) {
			await post.updateOne({ $set: { isPrivate: true } });
			const updatedPost = await Post.findById(request.params.postId);
			return response.status(200).json({
				data: updatedPost,
				message: "The story has been made private",
			});
		} else {
			return response
				.status(400)
				.json({ error: "This story is already private" });
		}
	} catch (error) {
		return response.status(500).json({ error: "Internal server error!" });
	}
});

// get all posts
router.get("/all/posts", async (request, response) => {
	try {
		const posts = await Post.find({});
		return response.status(200).json({ data: posts });
	} catch (error) {
		return response.status(500).json(error);
	}
});

// get all engagement posts
router.get("/engagement/:userId", async (request, response) => {
	try {
		const user = await User.findById(request.params.userId);
		// all posts of user with which other user have engaged
		// and all posts of other users with which this user has engaged
		// and also they are public
		let engagementPosts = await Promise.all(
			user.engagement.map(async (postId) => {
				let post = await Post.findById(postId);
				return post;
			})
		);
		engagementPosts = engagementPosts.filter(
			(post) => post && post.isPrivate === false
		);

		return response.status(200).json({
			data: [...engagementPosts],
		});
	} catch (error) {
		return response.status(500).json({ error: "Internal server error!" });
	}
});

module.exports = router;
