const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// update user
router.put("/edit/:id", async (request, response) => {
	// user can only update his/her account or he/she must be an admin
	if (request.body._id === request.params.id) {
		// if user tries to update the password
		// if (request.body.password) {
		// 	try {
		// 		const salt = await bcrypt.genSalt(10);
		// 		request.body.password = await bcrypt.hash(request.body.password, salt);
		// 	} catch (error) {
		// 		return response.status(500).json(error);
		// 	}
		// }

		// update the user
		try {
			const user = await User.findByIdAndUpdate(request.params.id, {
				$set: request.body,
			});
			return response.status(200).json("Account has been updated");
		} catch (error) {
			return response.status(500).json(error);
		}
	} else {
		return response.status(403).json("you can update only your account");
	}
});

// delete user
router.delete("/:id", async (request, response) => {
	// user can only update his/her account or he/she must be an admin
	if (request.body.userId === request.params.id) {
		// update the user
		try {
			await User.findByIdAndDelete(request.params.id);
			return response.status(200).json("Account has been deleted");
		} catch (error) {
			return response.status(500).json(error);
		}
	} else {
		return response.status(403).json("you can delete only your account");
	}
});

// get a single user
router.get("/", async (request, response) => {
	const userId = request.query.userId;
	const username = request.query.username;
	try {
		const user = userId
			? await User.findById(userId)
			: await User.findOne({ username: username });
		const { password, updatedAt, ...others } = user._doc;
		return response.status(200).json({ data: others });
	} catch (error) {
		return response.status(500).json({ error: "Internal server error" });
	}
});

// get all users
router.get("/all", async (request, response) => {
	try {
		const users = await User.find({});
		return response.status(200).json({ data: users });
	} catch (error) {
		return response.status(500).json({ error: "Internal server error" });
	}
});

// get friends of a user
router.get("/friends/:userId", async (request, response) => {
	try {
		const user = await User.findById(request.params.userId);
		const friends = await Promise.all(
			user.followings.map((friendId) => {
				return User.findById(friendId);
			})
		);
		let friendList = [];
		friends.map((friend) => {
			const { _id, username, profilePicture } = friend;
			friendList.push({ _id, username, profilePicture });
		});
		console.log(friendList);
		return response.status(200).json(friendList);
	} catch (error) {
		return response.status(500).json(error);
	}
});

// follow a user
router.put("/:id/follow", async (request, response) => {
	if (request.body.userId !== request.params.id) {
		try {
			const user = await User.findById(request.params.id);
			const currentUser = await User.findById(request.body.userId);
			if (!user.followers.includes(request.body.userId)) {
				await user.updateOne({ $push: { followers: request.body.userId } });
				await currentUser.updateOne({
					$push: { followings: request.params.id },
				});
				return response.status(200).json({ message: "User has been followed" });
			} else {
				return response
					.status(403)
					.json({ error: "You are already following this user" });
			}
		} catch (error) {
			return response.status(500).json({ error: error });
		}
	} else {
		return response.status(403).json({ error: "You can't follow yourself" });
	}
});

// unfollow a user
router.put("/:id/unfollow", async (request, response) => {
	if (request.body.userId !== request.params.id) {
		try {
			const user = await User.findById(request.params.id);
			const currentUser = await User.findById(request.body.userId);
			if (user.followers.includes(request.body.userId)) {
				await user.updateOne({ $pull: { followers: request.body.userId } });
				await currentUser.updateOne({
					$pull: { followings: request.params.id },
				});
				return response
					.status(200)
					.json({ message: "User has been unfollowed!" });
			} else {
				return response
					.status(403)
					.json({ error: "You currently don't follow this user" });
			}
		} catch (error) {
			return response.status(500).json({ error: error });
		}
	} else {
		return response.status(403).json({ error: "You can't unfollow yourself" });
	}
});

module.exports = router;
