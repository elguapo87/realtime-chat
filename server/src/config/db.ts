import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("Connected", () => {
            console.log("Database Connected");
        });

        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
    } catch (error) {
        
    }
};

export default connectDB;