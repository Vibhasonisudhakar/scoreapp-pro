const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { isEmailConfigured, sendPasswordResetEmail } = require("../services/emailService");

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@scoreapp.com";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "Score123!";
const DEMO_NAME = process.env.DEMO_NAME || "Demo User";

function createToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        JWT_SECRET,
        { expiresIn: "1d" }
    );
}

function isMongoReady() {
    return mongoose.connection.readyState === 1;
}

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "name, email and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        if (!isMongoReady()) {
            return res.status(503).json({
                message: "Registration is unavailable because MongoDB is not connected",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email is already registered" });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hash,
        });

        const token = createToken({ id: user._id.toString(), email: user.email, name: user.name });

        return res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            message: "Account created successfully",
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to register" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required" });
        }

        if (!isMongoReady()) {
            if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
                const demoUser = { id: "demo-user", email: DEMO_EMAIL, name: DEMO_NAME };
                const token = createToken(demoUser);
                return res.json({ token, user: demoUser, mode: "demo" });
            }

            return res.status(401).json({
                message: "Invalid credentials. Use configured demo credentials or connect MongoDB.",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = createToken({ id: user._id.toString(), email: user.email, name: user.name });

        return res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to login" });
    }
};

exports.demoLogin = async (req, res) => {
    try {
        const demoUser = { id: "demo-user", email: DEMO_EMAIL, name: DEMO_NAME };
        const token = createToken(demoUser);

        return res.json({
            token,
            user: demoUser,
            mode: "demo",
            message: "Demo access granted",
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to start demo session" });
    }
};

exports.me = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    return res.json({ user: req.user });
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "email is required" });
        }

        if (!isMongoReady()) {
            return res.status(503).json({
                message: "Password reset is unavailable because MongoDB is not connected",
            });
        }

        const user = await User.findOne({ email });
        const genericMessage = "If the account exists, password reset instructions were sent";

        if (!user) {
            return res.json({ message: genericMessage });
        }

        const resetToken = crypto.randomBytes(24).toString("hex");
        const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
        const resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

        user.resetPasswordTokenHash = resetTokenHash;
        user.resetPasswordExpiresAt = resetPasswordExpiresAt;
        await user.save();

        const response = { message: genericMessage };

        if (isEmailConfigured()) {
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
            const resetUrl = `${frontendUrl.replace(/\/$/, "")}/?mode=reset&token=${encodeURIComponent(
                resetToken
            )}`;

            await sendPasswordResetEmail({
                to: email,
                resetUrl,
                expiryMinutes: 15,
            });
        } else if (process.env.NODE_ENV !== "production" || process.env.EXPOSE_RESET_TOKEN === "true") {
            console.warn("SMTP is not configured. Returning reset token in API response for development use.");
            response.resetToken = resetToken;
        } else {
            return res.status(503).json({
                message: "Password reset email is not configured on this server",
            });
        }

        return res.json(response);
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to start password reset" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "token and newPassword are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        if (!isMongoReady()) {
            return res.status(503).json({
                message: "Password reset is unavailable because MongoDB is not connected",
            });
        }

        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordTokenHash: tokenHash,
            resetPasswordExpiresAt: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordTokenHash = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        return res.json({ message: "Password reset successful. Please login." });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to reset password" });
    }
};