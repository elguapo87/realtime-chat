import express from "express"
import { protectRoute } from "../middleware/authUser";
import { createGroup, getAllUsersInGroup, getGroupMessages, getUserGroups, sendMessage, updateGroup } from "../controllers/groupController";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/user-groups", protectRoute, getUserGroups);
router.get("/messages/:groupId", protectRoute, getGroupMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.get("/users", protectRoute, getAllUsersInGroup);
router.post("/update/:groupId", protectRoute, updateGroup);

export default router;