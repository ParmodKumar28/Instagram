import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSinglePostAsync,
  postsSelector,
} from "../../redux/slices/postsSlice";
import { ColorRing } from "react-loader-spinner";
import PostCard from "../../components/post/PostCard";

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
      <div className="flex justify-center items-center min-h-[60vh]">
        <ColorRing
          visible={true}
          height={70}
          width={70}
          ariaLabel="color-ring-loading"
          colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
        />
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
