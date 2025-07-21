import express from "express"
import { protectRoute } from "../middleware/authUser";
import { createGroup, getAllUsersInGroup, getGroupMessages, getUserGroups, leaveGroup, sendMessage, updateGroup } from "../controllers/groupController";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/user-groups", protectRoute, getUserGroups);
router.get("/messages/:groupId", protectRoute, getGroupMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.get("/users", protectRoute, getAllUsersInGroup);
router.post("/update/:groupId", protectRoute, updateGroup);
router.post("/leave/:groupId", protectRoute, leaveGroup);

export default router;