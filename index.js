require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const commentRoute = require("./routes/comments");
const multer = require("multer");
const path = require("path");

// Initialize the server
const app = express();

// port
const PORT = process.env.PORT;

// connect to MongoDB cloud
mongoose.connect(
	process.env.MONGODB_URL,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
	() => {
		console.log("MongoDB cloud is connected");
	}
);

app.use("/images", express.static(path.join(__dirname, "public/images")));

// middlewares
app.use(express.json());
app.use(
	helmet({
		crossOriginResourcePolicy: false,
	})
);
app.use(morgan("common"));
app.use(cors());

const storage = multer.diskStorage({
	destination: (request, file, cb) => {
		cb(null, "public/images");
	},
	filename: (request, file, cb) => {
		cb(null, request.body.name);
	},
});
const upload = multer({ storage });
app.post("/api/upload", upload.single("file"), (request, response) => {
	try {
		return response.status(200).json("File uploaded!");
	} catch (error) {
		return response
			.status(500)
			.json({ error: "Story not created. Internal server error!" });
	}
});

// Routers
app.get("/", (request, response) => {
	return response.status(200).send("This is Digital Stories Backend");
});
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);

app.listen(PORT, () => {
	console.log(`Server is listening at PORT: ${PORT}`);
});
