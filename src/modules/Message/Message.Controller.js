import { Router } from "express";
import { createMessage, getMessagesByName, deleteMessage } from "./services/Message.service.js";
import { makeMessagePublic } from "./services/Message.service.js";

const MessageController = Router();

import { authMiddleware } from "../../Middlewares/Authentication.middleware.js";

MessageController.post("/messages/send-messages/:receiverId", createMessage);
MessageController.get("/messages", getMessagesByName);
MessageController.delete("/messages/:messageId", authMiddleware, deleteMessage);
MessageController.patch("/messages/public/:messageId", authMiddleware, makeMessagePublic);

export default MessageController;
