import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.logIn);
authRouter.get("/logout",authMiddleware, AuthController.logOut);
authRouter.get("/me",authMiddleware, AuthController.me);

export default authRouter;
