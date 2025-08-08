import { Request, Response } from "express";
import { UserDocument } from "../models/userModel";
import cloudinary from "../lib/cloudinary";
import groupModel from "../models/groupModel";
import groupMessageModel from "../models/groupMessageModel";
import { getIO } from "../lib/socketServer";

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


export const getAllUsersInGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { groupId } = req.params;

        const group = await groupModel.findById(groupId).select("members").populate("members", "fullName profileImage");

        if (!group) {
            res.json({ success: false, message: "Group not found" });
            return;
        }

        res.json({ success: true, members: group.members });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const updateGroup = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?._id as string;
        const { groupId } = req.params;
        const { name, members, image } = req.body;

        let imageUrl = "";
        if (image) {
            const uploadRes = await cloudinary.uploader.upload(image, {
                folder: "realtime_chat"
            });
            imageUrl = uploadRes.secure_url;
        }

        const updateData: any = {};
        let newlyAddedMembers: string[] = [];

        if (name) updateData.name = name;
        if (image) updateData.image = imageUrl;

        if (members) {
            const group = await groupModel.findById(groupId).select("members");
            const existingMembers = group?.members.map((id: string) => id.toString()) || [];

            const incomingMembers = members.map((id: string) => id.toString());
            const mergedMembers = [...new Set([...existingMembers, ...incomingMembers, userId.toString()])];

            updateData.members = mergedMembers;

            // 🔥 Identify new users that were not in the original list
            newlyAddedMembers = mergedMembers.filter(id => !existingMembers.includes(id));
        }

        const updatedGroup = await groupModel.findByIdAndUpdate(groupId, updateData, { new: true });

        // 🔄 Emit to existing group members
        getIO().to(groupId).emit("groupUpdated", updatedGroup);

        // 🔥 Emit to newly added members individually
        for (const memberId of newlyAddedMembers) {
            const io = getIO();
            io.to(memberId).emit("groupCreated", updatedGroup); // Reuse groupCreated event logic
        }

        res.json({
            success: true,
            updatedGroup,
            message: "Group updated"
        });

    } catch (error) {
        console.error("Update group error:", error);
        res.status(500).json({ success: false, message: "Failed to update group." });
    }
};


export const leaveGroup = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { groupId } = req.params;

        await groupModel.findByIdAndUpdate(groupId, {
            $pull: {
                members: userId
            }
        });

        // Fetch the updated group to get new member list
        const updatedGroup = await groupModel.findById(groupId);

        // Emit groupUpdated to all remaining members
        if (updatedGroup) {
            updatedGroup.members.forEach((memberId: string) => {
                getIO().to(memberId.toString()).emit("groupUpdated", updatedGroup);
            });
        }

        res.json({ success: true, message: "You left group" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};