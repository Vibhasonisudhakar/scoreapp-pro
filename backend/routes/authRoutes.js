const express = require("express");
const router = express.Router();
const {
	register,
	login,
	demoLogin,
	me,
	forgotPassword,
	resetPassword,
} = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/demo-login", demoLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", auth, me);

module.exports = router;