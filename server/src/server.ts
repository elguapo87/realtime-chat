import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import http from "http";

// Create Expres app and HTTP server
const app: Express = express();
const server = http.createServer(app);

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors()); 

app.use("/api/status", (req, res) => {
    res.send("Server is live");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
    
});

