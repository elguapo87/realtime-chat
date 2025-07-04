import { Request, Response } from 'express';
import userModel from '../models/userModel';
import bcrypt from "bcryptjs";
import { genToken } from '../lib/genToken';

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