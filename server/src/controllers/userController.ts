import { Request, Response } from 'express';
import userModel, { UserDocument } from '../models/userModel';
import bcrypt from "bcryptjs";
import { genToken } from '../lib/genToken';
import cloudinary from '../lib/cloudinary';
import { getIO } from '../lib/socketServer';

interface AuthenticatedRequest extends Request {
    user?: UserDocument;
}

export const signUp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, fullName, password, bio } = req.body;
        if (!email || !fullName || !password) {
            res.json({ success: false, message: "Missing Details" });
            return;
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            res.json({ success: false, message: "Account already exists" });
            return;
        }

        if (password.length < 8) {
            res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await userModel.create({
            email,
            fullName,
            password: hashedPassword,
            bio
        });

        const token = genToken(user._id);

        res.json({
            success: true,
            userData: user,
            token,
            message: "Account created successfully"
        });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.json({ success: false, message: errMessage });
    }
};


export const validateSignUp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, fullName } = req.body;

        if (!email || !password || !fullName) {
            res.status(400).json({ success: false, message: "Missing fields" });
            return;
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            res.status(400).json({ success: false, message: "Account already exists" });
            return;
        }

        if (password.length < 8) {
            res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
            return;
        }

        res.json({ success: true, message: "Validation passed" })

    } catch (error) {
        res.status(500).json({ success: false, message: "Validation error" });
    }
};


export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            res.json({ success: false, message: "Account not exists" });
            return;
        }

        const matchingPassword = await bcrypt.compare(password, user.password);
        if (!matchingPassword) {
            res.json({ success: false, message: "Invalid credentials" });
            return;
        }

        const token = genToken(user._id);

        res.json({
            success: true,
            userData: user,
            token,
            message: "Login successfully"
        });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.json({ success: false, message: errMessage });
    }
};


export const checkAuth = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        res.status(200).json({ success: true, user: req.user });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.status(500).json({ success: false, message: errMessage });
    }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { bio, fullName, profileImage } = req.body;
        const userId = req.user?._id;

        let updatedUser;

        if (!profileImage) {
            updatedUser = await userModel.findByIdAndUpdate(userId, { bio, fullName }, { new: true }).select("-password");

        } else {
            const uploadRes = await cloudinary.uploader.upload(profileImage, {
                folder: "realtime_chat"
            });

            const imageUrl = uploadRes.secure_url;

            updatedUser = await userModel.findByIdAndUpdate(userId, { profileImage: imageUrl, bio, fullName }, { new: true }).select("-password");
        }

        res.json({
            success: true,
            user: updatedUser,
            message: "Profile updated"
        })

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.status(500).json({ success: false, message: errMessage });
    }
};

export const blockUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const currentUserId = req.user?._id;
        
        const { userId } = req.params;

        await userModel.findByIdAndUpdate(currentUserId, {
            $addToSet: { blocked: userId }
        });

        // Emit socket event from server here:
        getIO().emit("blockStatusChanged", {
            blockerId: currentUserId,
            blockedId: userId,
            isBlocked: true
        });

        res.json({ success: true, message: "User blocked" });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.status(500).json({ success: false, message: errMessage });
    }
};

export const unblockUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const currentUserId = req.user?._id;

        const { userId } = req.params;

        await userModel.findByIdAndUpdate(currentUserId, {
            $pull: { blocked: userId }
        });

        // Emit socket event from server here:
        getIO().emit("blockStatusChanged", {
            blockerId: currentUserId,
            blockedId: userId,
            isBlocked: false
        });

        res.json({ success: true, message: "User unblocked" });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.status(500).json({ success: false, message: errMessage });
    }
};


export const getFullBlockedStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const currentUserId = req.user?._id;
        const { userId } = req.params;

        const currentUser = await userModel.findById(currentUserId).select("blocked");
        const selectedUser = await userModel.findById(userId).select("blocked");

        const isCurrentUserBlocked = selectedUser?.blocked?.includes(currentUserId);
        const isReceiverBlocked = currentUser?.blocked?.includes(userId);

        res.json({ success: true, isCurrentUserBlocked, isReceiverBlocked });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to check blocked status." });
    }
};