import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import ConversationController from "../controllers/conversation.controller.js";

const conversationRouter = Router();

conversationRouter.get(
  "/check-connect-code",
  authMiddleware,
  ConversationController.checkConnectCode
);
conversationRouter.get(
  "/",
  authMiddleware,
  ConversationController.getConversation
);

export default conversationRouter;
