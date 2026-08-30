import { ErrorHandler } from "../../../utils/errorHandler.js";
import { uploadMedia } from "../../../utils/cloudinary.js";
import {
  getUserConversationsDb,
  getOrCreateConversationDb,
  getConversationMessagesDb,
  sendMessageDb,
  markMessagesSeenDb,
  deleteMessageDb,
} from "../model/chat.repository.js";

// Get user's conversation list
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const conversations = await getUserConversationsDb(userId);

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

// Get or create conversation with specific user
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const recipientId =
      req.params.recipientId ||
      req.params.userId ||
      req.params.id ||
      req.body.recipientId ||
      req.body.userId;

    if (!recipientId) {
      return next(new ErrorHandler(400, "Recipient user ID is required"));
    }

    const conversation = await getOrCreateConversationDb(senderId, recipientId);

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

// Get messages for conversation
export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const conversationId =
      req.params.conversationId ||
      req.params.chatId ||
      req.params.id;

    if (!conversationId) {
      return next(new ErrorHandler(400, "Conversation ID is required"));
    }

    const messages = await getConversationMessagesDb(conversationId, userId);

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

// Send message
export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { recipientId, text } = req.body;
    let mediaUrl = req.body.media || "";
    let mediaType = req.body.mediaType || "text";

    if (!recipientId) {
      return next(new ErrorHandler(400, "Recipient ID is required"));
    }

    if (req.file) {
      mediaUrl = await uploadMedia(req.file);
      mediaType = req.file.mimetype?.startsWith("video") ? "video" : "image";
    }

    if (!text && !mediaUrl) {
      return next(new ErrorHandler(400, "Message cannot be empty"));
    }

    const result = await sendMessageDb(
      senderId,
      recipientId,
      text || "",
      mediaUrl,
      mediaType
    );

    return res.status(201).json({
      success: true,
      msg: "Message sent",
      message: result.message,
      conversationId: result.conversationId,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

// Mark messages as seen
export const markSeen = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    if (!conversationId) {
      return next(new ErrorHandler(400, "Conversation ID is required"));
    }

    await markMessagesSeenDb(conversationId, userId);

    return res.status(200).json({
      success: true,
      msg: "Messages marked as seen",
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

// Delete / unsend message
export const deleteMessage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    if (!messageId) {
      return next(new ErrorHandler(400, "Message ID is required"));
    }

    const result = await deleteMessageDb(messageId, userId);

    return res.status(200).json({
      success: true,
      msg: "Message unsent",
      ...result,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};
