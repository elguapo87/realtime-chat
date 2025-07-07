import { Request, Response } from "express";
import userModel, { UserDocument } from "../models/userModel";
import cloudinary from "../lib/cloudinary";
import messageModel from "../models/messageModel";
import { userSocketMap } from "../lib/socket";
import { getIO } from "../lib/socketServer";

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

        // Emit the message using shared `io`
        const io = getIO();
        const receiverSocketId = userSocketMap[receiverId];

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

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


export const getUsersForSidebar = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const filteredUsers = await userModel.find({ _id: { $ne: userId } }).select("-password");

        // Count number of messages not seen
        const unseenMessages: Record<string, number> = {};
        const promises = filteredUsers.map(async (user) => {
            const messages = await messageModel.find({ senderId: user._id, receiverId: userId, seen: false });
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        });

        await Promise.all(promises);

        res.json({ success: true, users: filteredUsers, unseenMessages });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.json({ success: false, message: errMessage });
    }
};

export const getAllMessagesForSelectedUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user?._id;

        const messages = await messageModel.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        });

        await messageModel.updateMany({ senderId: selectedUserId, receiverId: myId }, {
            seen: true
        });

        res.json({ success: true, messages });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.json({ success: false, message: errMessage });
    }
};