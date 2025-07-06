import express from "express";
import { protectRoute } from "../middleware/authUser";
import { getAllMessagesForSelectedUser, getUsersForSidebar, markMessageAsSeen, sendMessage } from "../controllers/messageController";

const router = express.Router();

router.post("/send/:id", protectRoute, sendMessage);
router.post("/mark/:id", protectRoute, markMessageAsSeen);
router.get("/users", protectRoute, getUsersForSidebar);
router.get("/messages/:id", protectRoute, getAllMessagesForSelectedUser);

export default router;