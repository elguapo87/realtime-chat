import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "group",
        required: true
    },
    text: {
        type: String
    },
    image: {
        type: String
    }
}, { timestamps: true });

const groupMessageModel = mongoose.models.groupMessage || mongoose.model("groupMessage", groupMessageSchema);

export default groupMessageModel;