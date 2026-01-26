import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import MessageController from "../controllers/message.controller.js";

const messageRouter = Router();

messageRouter.get(
  "/:conversationId/messages",
  authMiddleware,
  MessageController.getMessages,
);

export default messageRouter;
