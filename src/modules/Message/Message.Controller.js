import { Router } from "express";
import { createMessage, getMessagesByName, deleteMessage, getAllPublicMessages, getMessagesForLoggedInUser } from "./services/Message.service.js";
import { makeMessagePublic } from "./services/Message.service.js";

const MessageController = Router();

import { authMiddleware } from "../../Middlewares/Authentication.middleware.js";

MessageController.post("/messages/send-messages/:receiverId", authMiddleware, createMessage);
MessageController.get("/messages", authMiddleware, getMessagesByName);
MessageController.get("/messages/public", authMiddleware, getAllPublicMessages);
MessageController.get("/messages/user", authMiddleware, getMessagesForLoggedInUser);
MessageController.delete("/messages/:messageId", authMiddleware, deleteMessage);
MessageController.patch("/messages/public/:messageId", authMiddleware, makeMessagePublic);

export default MessageController;
