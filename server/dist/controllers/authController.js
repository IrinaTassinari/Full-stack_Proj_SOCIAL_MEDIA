import { User } from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { AppError } from "../utils/appError.js";
import crypto from "crypto";
import { env } from "../config/env.js";
import { sendEmail } from "../utils/sendEmail.js";
export const register = async (req, res, next) => {
    try {
        // Read the registration fields from the request body.
        const { username, email, password, fullName } = req.body;
        if (!username || !email || !password || !fullName) {
            throw new AppError("Fields username, email, password and fullName are required", 400);
        }
        // Email and username must both be unique.
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            throw new AppError("User with this email or username already exists", 409);
        }
        // The password is hashed by the User model before saving.
        const user = new User({
            username,
            email,
            password,
            fullName,
        });
        await user.save();
        // Return a JWT immediately so the user is logged in after registration.
        const token = generateToken(user._id.toString());
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        // The user can log in with either username or email.
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            throw new AppError("Email/username and password required", 400);
        }
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        }).select("+password");
        if (!user) {
            throw new AppError("Invalid password or email", 401);
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new AppError("Invalid password or email", 401);
        }
        // Generate a JWT after the credentials have been verified.
        const token = generateToken(user._id.toString());
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                userId: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const forgotPassword = async (req, res, next) => {
    try {
        const { identifier } = req.body ?? {};
        if (!identifier) {
            throw new AppError("Email or username is required", 400);
        }
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });
        if (!user) {
            throw new AppError("User not found", 404);
        }
        // Send the raw reset token by email, but store only its hash in MongoDB.
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedResetToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        user.passwordResetToken = hashedResetToken;
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        const resetUrl = `${env.clientUrl}/reset-password/${resetToken}`;
        await sendEmail({
            to: user.email,
            subject: "Reset your ICHgram password",
            text: `You requested a password reset. Open this link to reset your password: ${resetUrl}`,
        });
        res.status(200).json({
            success: true,
            message: "Password reset link has been sent to your email",
        });
    }
    catch (error) {
        next(error);
    }
};
export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body ?? {};
        if (!token) {
            throw new AppError("Reset token is required", 400);
        }
        if (!password) {
            throw new AppError("New password is required", 400);
        }
        // Hash the URL token and compare it with the hashed token stored in MongoDB.
        const hashedResetToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
        const user = await User.findOne({
            passwordResetToken: hashedResetToken,
            passwordResetExpires: { $gt: new Date() },
        }).select("+password");
        if (!user) {
            throw new AppError("Reset token is invalid or has expired", 400);
        }
        user.password = password;
        // Clear reset fields so the same reset link cannot be reused.
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        const jwtToken = generateToken(user._id.toString());
        res.status(200).json({
            success: true,
            message: "Password has been reset successfully",
            token: jwtToken,
            user: {
                userId: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
