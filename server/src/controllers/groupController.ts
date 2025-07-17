import { Request, Response } from "express";
import { UserDocument } from "../models/userModel";
import cloudinary from "../lib/cloudinary";
import groupModel from "../models/groupModel";
import groupMessageModel from "../models/groupMessageModel";
import { getIO } from "../lib/socketServer";
import { userSocketMap } from "../lib/socket";
import { strict } from "assert";

interface AuthenticatedRequest extends Request {
    user?: UserDocument;
}

export const createGroup = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        const createdBy = user?._id;
        const { name, members, image } = req.body;

        let imageUrl = "";
        if (image) {
            const uploadRes = await cloudinary.uploader.upload(image, {
                folder: "realtime_chat"
            });
            imageUrl = uploadRes.secure_url;
        }

        const newGroup = await groupModel.create({
            name,
            image: imageUrl,
            members: [...members, createdBy],
            createdBy
        });

        const io = getIO();
        io.emit("groupCreated", newGroup);

        res.json({ success: true, group: newGroup });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create group." });
    }
};

export const getUserGroups = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?._id;

        const groups = await groupModel.find({ members: userId });
        res.json({ success: true, groups });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to get groups." });
    }
};


export const getGroupMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { groupId } = req.params;
        const userId = req.user?._id;

        const group = await groupModel.findById(groupId);
        if (!group) {
            res.json({ success: false, message: "Group not found" });
            return;
        }

        if (!group.members.includes(userId)) {
            res.json({ success: false, message: "You are not a member of this group" });
            return;
        }

        const messages = await groupMessageModel.find({ groupId }).sort({ createdAt: 1 });
        res.json({ success: true, messages });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { text, image } = req.body;
        const senderId = req.user?._id;
        const groupId = req.params.id;

        let imageUrl = "";

        if (image) {
            const uploadRes = await cloudinary.uploader.upload(image, {
                folder: "realtime_chat"
            });
            imageUrl = uploadRes.secure_url
        }

        const groupMessage = await groupMessageModel.create({
            senderId,
            groupId,
            text,
            image: imageUrl
        });

        // Emit the message using shared `io`
        const io = getIO();
        io.to(groupId.toString()).emit("groupMessage", groupMessage);

        res.json({ success: true, groupMessage });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};