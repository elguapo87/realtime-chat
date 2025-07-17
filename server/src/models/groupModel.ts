import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
}, { timestamps: true });

const groupModel = mongoose.models.group || mongoose.model("group", groupSchema);

export default groupModel;