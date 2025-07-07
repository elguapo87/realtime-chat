import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import http from "http";
import connectDB from "./config/db";
import userRoutes from "./routes/userRoutes";
import messageRoutes from "./routes/messageRoutes";
import { registerSocketServer } from "./lib/socket";
import { Server as SocketIOServer } from "socket.io";

// Create Expres app and HTTP server
const app: Express = express();

const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: "*"
  }
});

// Register socket handlers
registerSocketServer(io);

// Middleware setup
app.use(express.json({ limit: "4mb" }));
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true
};
app.use(cors(corsOptions));

app.use("/api/status", (req, res) => {
    res.send("Server is live");
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);

const PORT = process.env.PORT || 5000;

// Connect to DB
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on PORT: ${PORT}`);
        });

    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

startServer();

