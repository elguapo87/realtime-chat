import express from "express"
import { protectRoute } from "../middleware/authUser";
import { createGroup, getGroupMessages, getUserGroups, sendMessage } from "../controllers/groupController";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/user-groups", protectRoute, getUserGroups);
router.get("/messages/:groupId", protectRoute, getGroupMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;