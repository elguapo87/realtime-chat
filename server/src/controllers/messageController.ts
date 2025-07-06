import { Request, Response } from "express";
import { UserDocument } from "../models/userModel";
import cloudinary from "../lib/cloudinary";
import messageModel from "../models/messageModel";

interface AuthenticatedRequest extends Request {
    user?: UserDocument;
}

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const user = req.user;
        const senderId = user?._id;

        let imageUrl;
        if (image) {
            const uploadRes = await cloudinary.uploader.upload(image, {
                folder: "realtime_chat"
            });
            imageUrl = uploadRes.secure_url;
        }

        const newMessage = await messageModel.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        res.json({ success: true, newMessage });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.json({ success: false, message: errMessage });
    }
};


export const markMessageAsSeen = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        
        await messageModel.findByIdAndUpdate(id, { seen: true });

        res.json({ success: true });
        
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.json({ success: false, message: errMessage });
    }
};