import express from "express";
import { checkAuth, login, signUp } from "../controllers/userController";

const router = express.Router();

router.post("/sign-up", signUp);
router.post("/login", login);
router.post("/check", checkAuth);

export default router;