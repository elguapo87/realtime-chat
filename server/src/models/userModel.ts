import mongoose, { Document } from "mongoose";

export interface UserDocument extends Document {
    email: string;
    fullName: string;
    password: string;
    profileImage?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
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
    }
}, { timestamps: true });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;