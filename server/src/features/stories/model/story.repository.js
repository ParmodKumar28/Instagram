import { ObjectId } from "mongodb";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import StoryModel from "./story.schema.js";
import UserModel from "../../user/model/user.schema.js";
import FollowerModel from "../../followers/model/follower.schema.js";

// Create a new story
export const createStoryDb = async (userId, media, mediaType = "image", caption = "") => {
  try {
    const newStory = new StoryModel({
      user: new ObjectId(userId),
      media,
      mediaType,
      caption,
    });
    await newStory.save();
    return await newStory.populate("user", "name username profilePic gender accountType");
  } catch (error) {
    throw error;
  }
};

// Get feed stories grouped by user for the active viewer
export const getFeedStoriesDb = async (viewerId) => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find who the viewer is following
    const viewerObjId = new ObjectId(viewerId);
    const acceptedFollows = await FollowerModel.find({
      follower: viewerObjId,
      status: "accepted",
    }).select("following");
    const followedUserIds = acceptedFollows.map((f) => f.following.toString());

    // Also include public users who posted stories
    const publicUsers = await UserModel.find({ accountType: "public" }).select("_id");
    const publicUserIds = publicUsers.map((u) => u._id.toString());

    const allowedUserIds = Array.from(
      new Set([viewerId.toString(), ...followedUserIds, ...publicUserIds])
    ).map((id) => new ObjectId(id));

    // Fetch active stories
    const stories = await StoryModel.find({
      user: { $in: allowedUserIds },
      createdAt: { $gte: cutoff },
    })
      .sort({ createdAt: 1 })
      .populate("user", "name username profilePic gender accountType")
      .populate("viewers.user", "name username profilePic gender")
      .populate("likes.user", "name username profilePic gender")
      .populate("replies.user", "name username profilePic gender");

    // Group stories by user
    const userMap = new Map();

    stories.forEach((story) => {
      if (!story.user) return;
      const uId = (story.user._id || story.user).toString();
      if (!userMap.has(uId)) {
        userMap.set(uId, {
          user: story.user,
          stories: [],
          hasUnviewed: false,
          isSelf: uId === viewerId.toString(),
          latestCreatedAt: story.createdAt,
        });
      }

      const group = userMap.get(uId);
      const isViewedByMe = (story.viewers || []).some(
        (v) => (v.user?._id || v.user)?.toString() === viewerId.toString()
      );
      const isLikedByMe = (story.likes || []).some(
        (l) => (l.user?._id || l.user)?.toString() === viewerId.toString()
      );

      // Deduplicate viewers uniquely by user ID
      const uniqueViewersMap = new Map();
      (story.viewers || []).forEach((v) => {
        const vUserId = (v.user?._id || v.user)?.toString();
        if (vUserId && !uniqueViewersMap.has(vUserId)) {
          uniqueViewersMap.set(vUserId, v);
        }
      });
      const uniqueViewers = Array.from(uniqueViewersMap.values());

      group.stories.push({
        _id: story._id,
        media: story.media,
        mediaType: story.mediaType,
        caption: story.caption,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
        viewers: uniqueViewers,
        likes: story.likes || [],
        replies: story.replies || [],
        isViewedByMe,
        isLikedByMe,
      });

      if (!isViewedByMe && !group.isSelf) {
        group.hasUnviewed = true;
      }
      group.latestCreatedAt = story.createdAt;
    });

    const userStoriesList = Array.from(userMap.values());

    // Sort: self first, then unviewed stories, then already viewed stories, by latest
    userStoriesList.sort((a, b) => {
      if (a.isSelf) return -1;
      if (b.isSelf) return 1;
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return new Date(b.latestCreatedAt) - new Date(a.latestCreatedAt);
    });

    return userStoriesList;
  } catch (error) {
    throw error;
  }
};

// Get stories for a specific user
export const getUserStoriesDb = async (targetUserId, viewerId) => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const targetUser = await UserModel.findById(targetUserId).select(
      "name username profilePic gender accountType"
    );
    if (!targetUser) throw new ErrorHandler(404, "User not found");

    if (targetUser.accountType === "private") {
      const isSelf = targetUserId.toString() === viewerId.toString();
      if (!isSelf) {
        const isFollowing = await FollowerModel.findOne({
          follower: new ObjectId(viewerId),
          following: new ObjectId(targetUserId),
          status: "accepted",
        });
        if (!isFollowing) {
          throw new ErrorHandler(403, "This account is private.");
        }
      }
    }

    const stories = await StoryModel.find({
      user: new ObjectId(targetUserId),
      createdAt: { $gte: cutoff },
    })
      .sort({ createdAt: 1 })
      .populate("user", "name username profilePic gender accountType")
      .populate("viewers.user", "name username profilePic gender")
      .populate("likes.user", "name username profilePic gender")
      .populate("replies.user", "name username profilePic gender");

    return stories.map((s) => {
      // Deduplicate viewers uniquely by user ID
      const uniqueViewersMap = new Map();
      (s.viewers || []).forEach((v) => {
        const vUserId = (v.user?._id || v.user)?.toString();
        if (vUserId && !uniqueViewersMap.has(vUserId)) {
          uniqueViewersMap.set(vUserId, v);
        }
      });

      return {
        _id: s._id,
        media: s.media,
        mediaType: s.mediaType,
        caption: s.caption,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        viewers: Array.from(uniqueViewersMap.values()),
        likes: s.likes || [],
        replies: s.replies || [],
        isViewedByMe: (s.viewers || []).some(
          (v) => (v.user?._id || v.user)?.toString() === viewerId.toString()
        ),
        isLikedByMe: (s.likes || []).some(
          (l) => (l.user?._id || l.user)?.toString() === viewerId.toString()
        ),
      };
    });
  } catch (error) {
    throw error;
  }
};

// Mark story as viewed by current user (strictly unique per user)
export const markStoryViewedDb = async (storyId, viewerId) => {
  try {
    const story = await StoryModel.findById(storyId);
    if (!story) throw new ErrorHandler(404, "Story not found");

    const existingIndex = story.viewers.findIndex(
      (v) => (v.user?._id || v.user)?.toString() === viewerId.toString()
    );

    if (existingIndex !== -1) {
      // Update timestamp without adding duplicate entry
      story.viewers[existingIndex].viewedAt = new Date();
    } else {
      story.viewers.push({
        user: new ObjectId(viewerId),
        viewedAt: new Date(),
      });
    }

    await story.save();
    return story;
  } catch (error) {
    throw error;
  }
};

// Toggle like story
export const toggleLikeStoryDb = async (storyId, userId) => {
  try {
    const story = await StoryModel.findById(storyId);
    if (!story) throw new ErrorHandler(404, "Story not found");

    if (!story.likes) story.likes = [];

    const existingIndex = story.likes.findIndex(
      (l) => (l.user?._id || l.user)?.toString() === userId.toString()
    );

    let isLiked = false;
    if (existingIndex !== -1) {
      // Remove like
      story.likes.splice(existingIndex, 1);
      isLiked = false;
    } else {
      // Add like
      story.likes.push({
        user: new ObjectId(userId),
        createdAt: new Date(),
      });
      isLiked = true;
    }

    await story.save();
    return {
      isLiked,
      likesCount: story.likes.length,
      storyAuthorId: story.user.toString(),
    };
  } catch (error) {
    throw error;
  }
};

// Reply to story
export const replyStoryDb = async (storyId, userId, text) => {
  try {
    const story = await StoryModel.findById(storyId);
    if (!story) throw new ErrorHandler(404, "Story not found");

    if (!story.replies) story.replies = [];

    const newReply = {
      user: new ObjectId(userId),
      text: text.trim(),
      createdAt: new Date(),
    };

    story.replies.push(newReply);
    await story.save();

    return {
      reply: newReply,
      storyAuthorId: story.user.toString(),
      storyMedia: story.media,
    };
  } catch (error) {
    throw error;
  }
};

// Delete story by author
export const deleteStoryDb = async (storyId, userId) => {
  try {
    const story = await StoryModel.findById(storyId);
    if (!story) throw new ErrorHandler(404, "Story not found");

    if (story.user.toString() !== userId.toString()) {
      throw new ErrorHandler(403, "You are not authorized to delete this story");
    }

    await StoryModel.findByIdAndDelete(storyId);
    return story;
  } catch (error) {
    throw error;
  }
};
