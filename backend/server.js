const express = require("express");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const corsOrigin = process.env.CORS_ORIGIN || "*";
const frontendBuildPath = path.join(__dirname, "../frontendcd/build");
const frontendIndexPath = path.join(frontendBuildPath, "index.html");
const hasFrontendBuild = fs.existsSync(frontendIndexPath);

// Middleware
app.use(express.json());
app.use(cors({ origin: corsOrigin }));

if (hasFrontendBuild) {
	app.use(express.static(frontendBuildPath));
}

app.get("/api/health", (req, res) => {
	res.json({
		status: "ok",
		message: "ScoreApp backend is running",
	});
});

app.get("/", (req, res) => {
	if (hasFrontendBuild) {
		res.sendFile(frontendIndexPath);
		return;
	}

	res.json({
		status: "ok",
		message: "ScoreApp backend is running",
	});
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/score", require("./routes/scoreRoutes"));

app.use((req, res, next) => {
	if (req.method === "GET" && !req.path.startsWith("/api") && hasFrontendBuild) {
		res.sendFile(frontendIndexPath);
		return;
	}

	next();
});

app.use((req, res) => {
	res.status(404).json({
		message: req.path.startsWith("/api") ? "API route not found" : "Not found",
	});
});

// DB connect
if (process.env.MONGO_URI) {
	mongoose
		.connect(process.env.MONGO_URI)
		.then(() => console.log("MongoDB Connected"))
		.catch((err) => {
			console.error("MongoDB connection failed:", err.message);
		});
} else {
	console.warn("MONGO_URI not set. Starting without database connection.");
}

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));