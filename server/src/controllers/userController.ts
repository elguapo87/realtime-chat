import { Request, Response } from 'express';
import userModel, { UserDocument } from '../models/userModel';
import bcrypt from "bcryptjs";
import { genToken } from '../lib/genToken';
import cloudinary from '../lib/cloudinary';

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
            token,
            message: "Account created successfully"
        });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.json({ success: false, message: errMessage });
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
            user,
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
