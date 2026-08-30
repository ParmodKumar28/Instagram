import mongoose from "mongoose";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import { MessageModel, ConversationModel } from "./chat.schema.js";
import UserModel from "../../user/model/user.schema.js";

// Helper to safely format ID
const toId = (id) => (id?._id ? id._id.toString() : id?.toString());

// Get all conversations for a user
export const getUserConversationsDb = async (userId) => {
  try {
    const uid = toId(userId);

    const conversations = await ConversationModel.find({
      participants: uid,
    })
      .sort({ updatedAt: -1 })
      .populate("participants", "name username profilePic gender accountType")
      .populate("lastMessage.sender", "name username profilePic");

    return conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => toId(p) !== uid
      );
      const unreadCount = conv.unreadCounts?.get?.(uid) || 0;

      return {
        _id: conv._id,
        participant: otherParticipant || null,
        participants: conv.participants,
        lastMessage: conv.lastMessage,
        unreadCount,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt,
      };
    });
  } catch (error) {
    throw error;
  }
};

// Find existing or create new conversation between two users
export const getOrCreateConversationDb = async (senderId, recipientId) => {
  try {
    const sId = toId(senderId);
    const rId = toId(recipientId);

    if (!rId) {
      throw new ErrorHandler(400, "Invalid recipient ID");
    }

    if (sId === rId) {
      throw new ErrorHandler(400, "Cannot create a conversation with yourself");
    }

    const recipient = await UserModel.findById(rId);
    if (!recipient) {
      throw new ErrorHandler(404, "Recipient user not found");
    }

    let conversation = await ConversationModel.findOne({
      participants: { $all: [sId, rId] },
    })
      .populate("participants", "name username profilePic gender accountType")
      .populate("lastMessage.sender", "name username profilePic");

    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [sId, rId],
        unreadCounts: new Map([
          [sId, 0],
          [rId, 0],
        ]),
        lastMessage: {
          text: "",
          sender: sId,
          createdAt: new Date(),
        },
      });

      conversation = await ConversationModel.findById(conversation._id).populate(
        "participants",
        "name username profilePic gender accountType"
      );
    }

    const otherParticipant = conversation.participants.find(
      (p) => toId(p) !== sId
    );

    return {
      _id: conversation._id,
      participant: otherParticipant || null,
      participants: conversation.participants,
      lastMessage: conversation.lastMessage,
      unreadCount: 0,
      updatedAt: conversation.updatedAt,
      createdAt: conversation.createdAt,
    };
  } catch (error) {
    throw error;
  }
};

// Get messages for a conversation & mark incoming messages as seen
export const getConversationMessagesDb = async (conversationId, userId) => {
  try {
    const convId = toId(conversationId);
    const uid = toId(userId);

    const conversation = await ConversationModel.findOne({
      _id: convId,
      participants: uid,
    });

    if (!conversation) {
      throw new ErrorHandler(404, "Conversation not found or unauthorized");
    }

    // Mark incoming messages as seen
    await MessageModel.updateMany(
      {
        conversation: convId,
        recipient: uid,
        seen: false,
      },
      {
        $set: { seen: true, seenAt: new Date() },
      }
    );

    // Reset unread count for current user
    if (conversation.unreadCounts) {
      conversation.unreadCounts.set(uid, 0);
      await conversation.save();
    }

    const messages = await MessageModel.find({
      conversation: convId,
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name username profilePic gender")
      .populate("recipient", "name username profilePic gender");

    return messages;
  } catch (error) {
    throw error;
  }
};

// Send a new message
export const sendMessageDb = async (
  senderId,
  recipientId,
  text = "",
  media = "",
  mediaType = "text"
) => {
  try {
    const sId = toId(senderId);
    const rId = toId(recipientId);

    // Find or create conversation
    let conversation = await ConversationModel.findOne({
      participants: { $all: [sId, rId] },
    });

    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [sId, rId],
        unreadCounts: new Map([
          [sId, 0],
          [rId, 0],
        ]),
      });
    }

    // Create the message
    const message = await MessageModel.create({
      conversation: conversation._id,
      sender: sId,
      recipient: rId,
      text,
      media,
      mediaType: media ? mediaType : "text",
      seen: false,
    });

    // Update conversation metadata and increment recipient's unreadCount
    const currentUnread = conversation.unreadCounts?.get?.(rId) || 0;
    if (!conversation.unreadCounts) {
      conversation.unreadCounts = new Map();
    }
    conversation.unreadCounts.set(rId, currentUnread + 1);

    conversation.lastMessage = {
      text: text || (mediaType === "image" ? "📷 Photo" : "🎥 Video"),
      sender: sId,
      media,
      mediaType: media ? mediaType : "text",
      createdAt: new Date(),
    };
    conversation.updatedAt = new Date();
    await conversation.save();

    const populatedMessage = await MessageModel.findById(message._id)
      .populate("sender", "name username profilePic gender")
      .populate("recipient", "name username profilePic gender");

    return {
      message: populatedMessage,
      conversationId: conversation._id,
    };
  } catch (error) {
    throw error;
  }
};

// Mark conversation messages as seen
export const markMessagesSeenDb = async (conversationId, userId) => {
  try {
    const convId = toId(conversationId);
    const uid = toId(userId);

    await MessageModel.updateMany(
      {
        conversation: convId,
        recipient: uid,
        seen: false,
      },
      {
        $set: { seen: true, seenAt: new Date() },
      }
    );

    const conversation = await ConversationModel.findById(convId);
    if (conversation && conversation.unreadCounts) {
      conversation.unreadCounts.set(uid, 0);
      await conversation.save();
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// Delete / Unsend a message
export const deleteMessageDb = async (messageId, userId) => {
  try {
    const msgId = toId(messageId);
    const uid = toId(userId);

    const message = await MessageModel.findOne({
      _id: msgId,
      sender: uid,
    });

    if (!message) {
      throw new ErrorHandler(404, "Message not found or not authorized to delete");
    }

    const conversationId = message.conversation;
    await MessageModel.findByIdAndDelete(msgId);

    // Update conversation last message if needed
    const lastMsg = await MessageModel.findOne({ conversation: conversationId }).sort({
      createdAt: -1,
    });

    const conversation = await ConversationModel.findById(conversationId);
    if (conversation) {
      if (lastMsg) {
        conversation.lastMessage = {
          text: lastMsg.text || (lastMsg.mediaType === "image" ? "📷 Photo" : "🎥 Video"),
          sender: lastMsg.sender,
          media: lastMsg.media,
          mediaType: lastMsg.mediaType,
          createdAt: lastMsg.createdAt,
        };
      } else {
        conversation.lastMessage = {
          text: "",
          sender: null,
          media: "",
          mediaType: "text",
          createdAt: new Date(),
        };
      }
      await conversation.save();
    }

    return { success: true, messageId, conversationId };
  } catch (error) {
    throw error;
  }
};
