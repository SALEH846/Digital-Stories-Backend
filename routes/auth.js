const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Register a new user
router.post("/register", async (request, response) => {
	try {
		// check if email already exist or not
		const userWithProvidedEmail = await User.findOne({
			email: request.body.email,
		});
		// if email already exist, return the response
		if (userWithProvidedEmail) {
			return response.status(403).json({ error: "Email already exists!" });
		}

		// check if username already exist or not
		const userWithProvidedUsername = await User.findOne({
			username: request.body.username,
		});
		console.log(userWithProvidedUsername);
		// if username already exist, return the response
		if (userWithProvidedUsername) {
			return response.status(403).json({ error: "User name already exists!" });
		}

		// Generate the hash of password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(request.body.password, salt);

		// Create new user
		const newUser = new User({
			fullname: request.body.fullname,
			username: request.body.username,
			email: request.body.email,
			password: hashedPassword,
		});

		// Save the new user in the database
		const user = await newUser.save();

		// return the response
		return response.status(200).json({ data: user, error: "" });
	} catch (error) {
		return response.status(500).json({ error: "Internal Server Error!" });
	}
});

// login the user
router.post("/login", async (request, response) => {
	try {
		// fetch the user form database with the email provided
		const user = await User.findOne({ email: request.body.email });

		// check if user exists
		if (!user) {
			return response
				.status(404)
				.json({ error: "User not found!", data: null });
		}

		// check it password is valid
		const validPassword = await bcrypt.compare(
			request.body.password,
			user.password
		);
		if (!validPassword) {
			return response.status(400).json({
				error: "Either the email or password you entered is incorrect!",
				data: null,
			});
		}

		// if user exists and password is valid then return the user
		return response.status(200).json({ data: user, error: "" });
	} catch (error) {
		return response.status(500).json({ error: "Internal server error!" });
	}
});

module.exports = router;
