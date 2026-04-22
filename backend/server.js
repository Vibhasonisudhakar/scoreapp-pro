const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const corsOrigin = process.env.CORS_ORIGIN || "*";

// Middleware
app.use(express.json());
app.use(cors({ origin: corsOrigin }));

app.get("/", (req, res) => {
	res.json({
		status: "ok",
		message: "ScoreApp backend is running",
	});
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/score", require("./routes/scoreRoutes"));

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