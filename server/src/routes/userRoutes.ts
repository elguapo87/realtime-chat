import express from "express";
import { checkAuth, login, signUp, updateProfile, validateSignUp } from "../controllers/userController";
import { protectRoute } from "../middleware/authUser";

const router = express.Router();

router.post("/signup", signUp);
router.post("/validate-signup", validateSignUp);
router.post("/login", login);
router.get("/check", protectRoute, checkAuth);
router.put("/update", protectRoute, updateProfile);

export default router;