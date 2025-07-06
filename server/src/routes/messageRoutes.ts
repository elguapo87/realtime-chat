import express from "express";
import { protectRoute } from "../middleware/authUser";
import { markMessageAsSeen, sendMessage } from "../controllers/messageController";

const router = express.Router();

router.post("/send/:id", protectRoute, sendMessage);
router.post("/mark/:id", protectRoute, markMessageAsSeen);

export default router;