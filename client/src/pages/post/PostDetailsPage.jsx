import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSinglePostAsync,
  postsSelector,
} from "../../redux/slices/postsSlice";
import PostCard from "../../components/post/PostCard";
import PostSkeleton from "../../components/common/skeletons/PostSkeleton";

export function PostDetailsPage() {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { singlePost, singlePostLoading } = useSelector(postsSelector);

  useEffect(() => {
    if (postId) {
      dispatch(fetchSinglePostAsync(postId));
    }
  }, [dispatch, postId]);

  if (singlePostLoading || !singlePost) {
    return (
      <div className="py-4 max-w-lg mx-auto">
        <PostSkeleton />
      </div>
    );
  }

  return (
    <div className="py-4 max-w-lg mx-auto">
      <PostCard post={singlePost} />
    </div>
  );
}

export default PostDetailsPage;
