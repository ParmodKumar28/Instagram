import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSinglePostAsync,
  postsSelector,
} from "../../redux/slices/postsSlice";
import PostDetailsModal from "../../components/post/PostDetailsModal";
import PostSkeleton from "../../components/common/skeletons/PostSkeleton";

export function PostDetailsPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { singlePost, singlePostLoading } = useSelector(postsSelector);

  useEffect(() => {
    if (postId) {
      dispatch(fetchSinglePostAsync(postId));
    }
  }, [dispatch, postId]);

  if (singlePostLoading || !singlePost) {
    return (
      <div className="py-6 max-w-lg mx-auto">
        <PostSkeleton />
      </div>
    );
  }

  return (
    <PostDetailsModal
      post={singlePost}
      onClose={() => navigate(-1)}
    />
  );
}

export default PostDetailsPage;
