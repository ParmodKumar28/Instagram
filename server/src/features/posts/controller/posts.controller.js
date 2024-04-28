// Creating here user controller to handle communication between routes and the model/database
// Imports
import { filePath } from "../../../app.js";
import uploadCloudinary from "../../../utils/cloudinary.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import {
  createPostDb,
  deletePostDb,
  getAllPostsDb,
  getPostDb,
  getUserPostsDb,
  updatePostDb,
} from "../model/posts.repository.js";

// Create new post
export const createPost = async (req, res, next) => {
  try {
    const postData = req.body;
    if (Object.keys(postData).length === 0) {
      return next(
        new ErrorHandler(400, "Please add post data to create new post!")
      );
    }
    postData.user = req.user._id;
    if (req.file) {
      const imageUrl = await uploadCloudinary(req.file.path);
      // const imageUrl = `${filePath}/${req.file.filename}`;
      postData.media = imageUrl;
    }
    // Passing to db to save the post here.
    const newPost = await createPostDb(postData, req.user);
    if (!newPost) {
      return next(
        new ErrorHandler(400, "Post, not created something went wrong!")
      );
    }
    // Sending response
    res.status(201).json({
      success: true,
      msg: "Post created!",
      newPost: newPost,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
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
    const updatedPost = await updatePostDb(postId, req.user._id, postData);
    if (!updatedPost) {
      return next(
        new ErrorHandler(400, "Post not updated something went wrong!")
      );
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
    if (!postId) {
      return next(new ErrorHandler(400, "Enter postId in the params!"));
    }
    const post = await getPostDb(postId);
    if (!post) {
      return next(new ErrorHandler(400, "No post found by this id!"));
    }
    return res.status(200).json({
      success: true,
      msg: "Post found successfully!",
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
    if (!userId) {
      return next(new ErrorHandler(400, "Enter user id please!"));
    }
    const posts = await getUserPostsDb(userId);
    if (posts.length === 0) {
      return next(
        new ErrorHandler(400, "No posts found please create some post's!")
      );
    }
    return res.status(200).json({
      success: true,
      msg: "Post's found successfully!",
      posts: posts,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Getting all posts
export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await getAllPostsDb();
    if (posts.length === 0) {
      return next(new ErrorHandler(400, "No post's found!"));
      ss;
    }
    return res.status(200).json({
      success: true,
      msg: "Post's found successfully!",
      posts: posts,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};
