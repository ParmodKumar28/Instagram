import { ErrorHandler } from "../../../utils/errorHandler.js";
import { uploadMedia } from "../../../utils/cloudinary.js";
import { emitToUser } from "../../../socket/index.js";
import {
  createPostDb,
  deletePostDb,
  getAllPostsDb,
  getPostDb,
  getTaggedPostsDb,
  getUserPostsDb,
  updatePostDb,
  toggleSavePostDb,
  getSavedPostsDb,
  getReelsDb,
} from "../model/posts.repository.js";

// Create new post
export const createPost = async (req, res, next) => {
  try {
    const postData = req.body;

    // Ensure that at least one field is provided
    if (!postData.caption && !postData.location && !req.file) {
      return next(
        new ErrorHandler(400, "Please add post data to create a new post!")
      );
    }

    // Assign the user ID to the post data
    postData.user = req.user._id;

    // Parse tags if sent as JSON string or comma-separated
    if (postData.tags) {
      if (typeof postData.tags === "string") {
        try {
          postData.tags = JSON.parse(postData.tags);
        } catch {
          postData.tags = postData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        }
      }
    }

    // If a file is uploaded, upload via uploadMedia (Cloudinary or Localhost based on config)
    if (req.file) {
      const imageUrl = await uploadMedia(req.file);
      postData.media = imageUrl;
    }

    // Save the new post to the database
    const newPost = await createPostDb(postData, req.user);

    // Check if the post was successfully created
    if (!newPost) {
      return next(
        new ErrorHandler(400, "Post not created, something went wrong!")
      );
    }

    // Live Socket Notification: Alert all tagged users
    if (newPost.tags && Array.isArray(newPost.tags) && newPost.tags.length > 0) {
      newPost.tags.forEach((taggedUser) => {
        const taggedId = (taggedUser?._id || taggedUser)?.toString();
        if (taggedId && taggedId !== req.user._id.toString()) {
          emitToUser(taggedId, "new_notification", {
            type: "tag",
            sender: {
              _id: req.user._id,
              username: req.user.username,
              name: req.user.name,
              profilePic: req.user.profilePic,
              gender: req.user.gender,
            },
            postId: newPost._id,
            message: `${req.user.username} tagged you in a post.`,
            createdAt: new Date(),
          });
        }
      });
    }

    // Respond with the created post
    res.status(201).json({
      success: true,
      msg: "Post created!",
      newPost: newPost,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message));
  }
};

// Deleting post
export const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    if (!postId) {
      return next(new ErrorHandler(400, "Please, enter post id in params!"));
    }
    const deletedPost = await deletePostDb(postId, req.user);
    if (!deletedPost) {
      return next(
        new ErrorHandler(400, "Post not deleted something went wrong!")
      );
    }

    return res.status(200).json({
      succes: true,
      msg: "Post deleted!",
      deletedPost: deletedPost,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Updating post
export const updatePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    if (!postId) {
      return next(new ErrorHandler(400, "Enter postId in the params!"));
    }
    const postData = req.body;
    if (Object.keys(postData).length === 0) {
      return next(new ErrorHandler(400, "Provide fields you want to update!"));
    }

    if (postData.tags) {
      if (typeof postData.tags === "string") {
        try {
          postData.tags = JSON.parse(postData.tags);
        } catch {
          postData.tags = postData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        }
      }
    }

    const updatedPost = await updatePostDb(postId, req.user._id, postData);
    if (!updatedPost) {
      return next(
        new ErrorHandler(400, "Post not updated something went wrong!")
      );
    }

    // Live Socket Notification: Alert newly tagged users
    if (updatedPost.tags && Array.isArray(updatedPost.tags) && updatedPost.tags.length > 0) {
      updatedPost.tags.forEach((taggedUser) => {
        const taggedId = (taggedUser?._id || taggedUser)?.toString();
        if (taggedId && taggedId !== req.user._id.toString()) {
          emitToUser(taggedId, "new_notification", {
            type: "tag",
            sender: {
              _id: req.user._id,
              username: req.user.username,
              name: req.user.name,
              profilePic: req.user.profilePic,
              gender: req.user.gender,
            },
            postId: updatedPost._id,
            message: `${req.user.username} tagged you in a post.`,
            createdAt: new Date(),
          });
        }
      });
    }

    return res.status(200).json({
      succes: true,
      msg: "Post updated!",
      updatedPost: updatedPost,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Getting single post by id
export const getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const viewerId = req.user?._id;
    if (!postId) {
      return next(new ErrorHandler(400, "Enter postId in the params!"));
    }
    const post = await getPostDb(postId, viewerId);
    if (!post) {
      return next(new ErrorHandler(400, "No post found by this id!"));
    }
    return res.status(200).json({
      success: true,
      msg: "Post found by id!",
      post: post,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Getting user posts
export const getUserPosts = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const viewerId = req.user?._id;
    if (!userId) {
      return next(new ErrorHandler(400, "Enter userId in the params!"));
    }
    const posts = await getUserPostsDb(userId, viewerId);
    return res.status(200).json({
      success: true,
      msg: "Posts found successfully!",
      posts: posts || [],
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Getting tagged posts for a user
export const getTaggedPosts = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const viewerId = req.user?._id;
    if (!userId) {
      return next(new ErrorHandler(400, "Enter userId in the params!"));
    }
    const posts = await getTaggedPostsDb(userId, viewerId);
    return res.status(200).json({
      success: true,
      msg: "Tagged posts found successfully!",
      posts: posts || [],
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Getting all posts from the db
export const getAllPosts = async (req, res, next) => {
  try {
    const viewerId = req.user?._id;
    const posts = await getAllPostsDb(viewerId);
    return res.status(200).json({
      success: true,
      msg: "Posts found successfully!",
      posts: posts || [],
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Toggle Save Post
export const toggleSavePost = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;
    if (!postId) {
      return next(new ErrorHandler(400, "Enter postId in params!"));
    }
    const result = await toggleSavePostDb(postId, userId);
    return res.status(200).json({
      success: true,
      msg: result.isSaved ? "Post saved!" : "Post removed from saved!",
      isSaved: result.isSaved,
      savedPosts: result.savedPosts,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Get Saved Posts
export const getSavedPosts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const savedPosts = await getSavedPostsDb(userId);
    return res.status(200).json({
      success: true,
      savedPosts: savedPosts || [],
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Get Reel Videos
export const getReels = async (req, res, next) => {
  try {
    const viewerId = req.user?._id;
    const reels = await getReelsDb(viewerId);
    return res.status(200).json({
      success: true,
      reels: reels || [],
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};
