import express from "express";
import { auth } from "../../../middlewares/auth.js";
import upload from "../../../middlewares/file-upload.js";
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markSeen,
  deleteMessage,
} from "../controller/chat.controller.js";

const chatRouter = express.Router();

// Get conversation list
chatRouter.get("/conversations", auth, getConversations);
chatRouter.get("/inbox", auth, getConversations);
chatRouter.get("/", auth, getConversations);

// Get or create conversation with specific user
chatRouter.get("/user/:recipientId", auth, getOrCreateConversation);
chatRouter.post("/user/:recipientId", auth, getOrCreateConversation);
chatRouter.get("/conversation/user/:recipientId", auth, getOrCreateConversation);
chatRouter.post("/conversation/user/:recipientId", auth, getOrCreateConversation);
chatRouter.post("/create", auth, getOrCreateConversation);

// Get messages for a conversation
chatRouter.get("/messages/:conversationId", auth, getMessages);
chatRouter.get("/message/:conversationId", auth, getMessages);
chatRouter.get("/t/:conversationId", auth, getMessages);
chatRouter.get("/:conversationId", auth, getMessages);

// Send message (support optional file attachment)
chatRouter.post("/send", auth, upload.single("media"), sendMessage);
chatRouter.post("/message", auth, upload.single("media"), sendMessage);

// Mark conversation as seen
chatRouter.post("/seen/:conversationId", auth, markSeen);
chatRouter.put("/seen/:conversationId", auth, markSeen);

// Unsend / Delete message
chatRouter.delete("/message/:messageId", auth, deleteMessage);
chatRouter.delete("/:messageId", auth, deleteMessage);

export default chatRouter;
