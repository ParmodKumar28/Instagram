import { ErrorHandler } from "../../../utils/errorHandler.js";
import { uploadMedia } from "../../../utils/cloudinary.js";
import {
  createStoryDb,
  getFeedStoriesDb,
  getUserStoriesDb,
  markStoryViewedDb,
  toggleLikeStoryDb,
  replyStoryDb,
  deleteStoryDb,
} from "../model/story.repository.js";
import StoryModel from "../model/story.schema.js";
import { emitToUser } from "../../../socket/index.js";

// Create a new story
export const createStory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let mediaUrl = req.body.media || "";
    const mediaType = req.body.mediaType || (req.file?.mimetype?.startsWith("video") ? "video" : "image");
    const caption = req.body.caption || "";

    if (req.file) {
      mediaUrl = await uploadMedia(req.file);
    }

    if (!mediaUrl) {
      return next(new ErrorHandler(400, "Please provide media for the story"));
    }

    const story = await createStoryDb(userId, mediaUrl, mediaType, caption);

    return res.status(201).json({
      success: true,
      msg: "Story uploaded successfully!",
      story,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

// Get stories for feed (grouped by user)
export const getFeedStories = async (req, res, next) => {
  try {
    const viewerId = req.user._id;
    const stories = await getFeedStoriesDb(viewerId);

    return res.status(200).json({
      success: true,
      stories,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

// Get stories for a specific user
export const getUserStories = async (req, res, next) => {
  try {
    const viewerId = req.user._id;
    const { userId } = req.params;

    if (!userId) {
      return next(new ErrorHandler(400, "User ID is required"));
    }

    const stories = await getUserStoriesDb(userId, viewerId);

    return res.status(200).json({
      success: true,
      stories,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

// Mark story as viewed
export const markStoryViewed = async (req, res, next) => {
  try {
    const viewerId = req.user._id;
    const { storyId } = req.params;

    if (!storyId) {
      return next(new ErrorHandler(400, "Story ID is required"));
    }

    const story = await markStoryViewedDb(storyId, viewerId);

    return res.status(200).json({
      success: true,
      story,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

// Toggle like story
export const toggleLikeStory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { storyId } = req.params;

    if (!storyId) {
      return next(new ErrorHandler(400, "Story ID is required"));
    }

    const result = await toggleLikeStoryDb(storyId, userId);

    if (result.isLiked) {
      try {
        const story = await StoryModel.findById(storyId);
        if (story && story.user && story.user.toString() !== userId.toString()) {
          emitToUser(story.user, "new_notification", {
            type: "story_like",
            sender: {
              _id: req.user._id,
              username: req.user.username,
              name: req.user.name,
              profilePic: req.user.profilePic,
            },
            message: `${req.user.username} liked your story.`,
            storyId,
            createdAt: new Date(),
          });
        }
      } catch (e) {
        console.error("Failed to emit story like notification:", e);
      }
    }

    return res.status(200).json({
      success: true,
      msg: result.isLiked ? "Story liked!" : "Story unliked",
      isLiked: result.isLiked,
      likesCount: result.likesCount,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

// Reply to story
export const replyStory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { storyId } = req.params;
    const { text } = req.body;

    if (!storyId) {
      return next(new ErrorHandler(400, "Story ID is required"));
    }
    if (!text || !text.trim()) {
      return next(new ErrorHandler(400, "Reply text cannot be empty"));
    }

    const result = await replyStoryDb(storyId, userId, text);

    try {
      const story = await StoryModel.findById(storyId);
      if (story && story.user && story.user.toString() !== userId.toString()) {
        emitToUser(story.user, "new_notification", {
          type: "story_reply",
          sender: {
            _id: req.user._id,
            username: req.user.username,
            name: req.user.name,
            profilePic: req.user.profilePic,
          },
          message: `${req.user.username} replied to your story: "${text.slice(0, 30)}${text.length > 30 ? "..." : ""}"`,
          storyId,
          createdAt: new Date(),
        });
      }
    } catch (e) {
      console.error("Failed to emit story reply notification:", e);
    }

    return res.status(200).json({
      success: true,
      msg: "Reply sent to story author!",
      reply: result.reply,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

// Delete story
export const deleteStory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { storyId } = req.params;

    if (!storyId) {
      return next(new ErrorHandler(400, "Story ID is required"));
    }

    await deleteStoryDb(storyId, userId);

    return res.status(200).json({
      success: true,
      msg: "Story deleted successfully!",
      storyId,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};
