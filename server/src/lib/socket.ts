import { Server } from "socket.io";

export const userSocketMap: { [userId: string]: string } = {};

export const registerSocketServer = (io: Server) => {
    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        console.log("User Connected", userId);

        if (typeof userId === "string") userSocketMap[userId] = socket.id;

        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        socket.on("disconnect", () => {
            console.log("User Disconnected", userId);
            if (typeof userId === "string") delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });
};