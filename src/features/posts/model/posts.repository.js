// Creating posts repository here for the database
// Imports

import PostModel from "./posts.schema";

// create new post in the db
export const createPostDb = async (post) => {
  const newPost = new PostModel(post).save();
  return newPost;
};
