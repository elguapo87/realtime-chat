import { NextFunction, Request, Response } from "express";
import userModel, { UserDocument } from "../models/userModel";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
    user?: UserDocument;
};

export const protectRoute = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.token as string;
        if (!token) {
            res.status(401).json({ success: false, message: "Unauthorized: No token" });
            return;
        }
        
        const secretKey = process.env.SECRET_KEY as string;
        if (!secretKey) {
            res.status(500).json({ success: false, message: "Missing SECRET_KEY" });
            return;
        }

        const decoded = jwt.verify(token, secretKey) as { userId: string };

        const user = await userModel.findById(decoded.userId).select("-password");
        if (!user) {
            res.status(401).json({ success: false, message: "Unauthorized: Invalid user" });
        }

        req.user = user;

        next();

    } catch (error) {
        console.error("protectRoute error:", error);
        res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
};