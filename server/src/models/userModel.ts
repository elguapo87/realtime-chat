import mongoose, { Document } from "mongoose";

export interface UserDocument extends Document {
    email: string;
    fullName: string;
    password: string;
    profileImage?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
    blocked: mongoose.Types.ObjectId[];
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: ""
    },
    bio: {
        type: String
    },
    blocked: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "user",
        default: []
    }
}, { timestamps: true });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;