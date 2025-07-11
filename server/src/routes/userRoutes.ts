import express from "express";
import { blockUser, checkAuth, login, signUp, unblockUser, updateProfile, validateSignUp } from "../controllers/userController";
import { protectRoute } from "../middleware/authUser";

const router = express.Router();

router.post("/signup", signUp);
router.post("/validate-signup", validateSignUp);
router.post("/login", login);
router.get("/check", protectRoute, checkAuth);
router.put("/update", protectRoute, updateProfile);
router.put("/block/:userId", protectRoute, blockUser);
router.put("/unblock/:userId", protectRoute, unblockUser);

export default router;