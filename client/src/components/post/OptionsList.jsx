import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleFollowAsync, followersSelector } from "../../redux/slices/followersSlice";
import { usersSelector } from "../../redux/slices/usersSlice";
import toast from "react-hot-toast";

export function OptionsList({ isAuthor, post, onDelete, onEdit, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { following = [] } = useSelector(followersSelector);
  const { signedUser } = useSelector(usersSelector);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const postUrl = `${window.location.origin}/post/${post?._id || ""}`;
  const authorId = (post?.user?._id || post?.user || "").toString();
  const authorUsername = post?.user?.username || post?.user?.name || "user";

  const isFollowing =
    following.some(
      (u) => (u.following?._id || u.following || u._id || "").toString() === authorId
    ) ||
    (signedUser?.following &&
      signedUser.following.some(
        (f) => (f._id || f || "").toString() === authorId
      ));

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success("Link copied to clipboard");
      onClose();
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleGoToPost = () => {
    onClose();
    if (post?._id) {
      navigate(`/post/${post._id}`);
    }
  };

  const handleVisitProfile = () => {
    onClose();
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  const handleReport = () => {
    toast.success("Thank you. This post has been reported for review.");
    onClose();
  };

  const handleToggleFollow = async () => {
    if (!authorId) return;
    try {
      await dispatch(toggleFollowAsync(authorId)).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[360px] shadow-2xl overflow-hidden divide-y divide-gray-100 text-center text-sm font-normal animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {showDeleteConfirm ? (
          <div className="p-5 space-y-3">
            <h3 className="font-semibold text-gray-900 text-base">Delete post?</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="pt-2 flex flex-col divide-y divide-gray-100">
              <button
                type="button"
                onClick={() => {
                  onDelete?.();
                  onClose();
                }}
                className="py-3 text-red-600 font-bold hover:bg-red-50 transition active:bg-red-100 rounded-lg"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="py-3 text-gray-700 hover:bg-gray-50 transition active:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : isAuthor ? (
          <>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3.5 text-red-600 font-bold hover:bg-red-50 transition active:bg-red-100"
            >
              Delete
            </button>

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit();
                  onClose();
                }}
                className="w-full py-3.5 text-gray-900 font-medium hover:bg-gray-50 transition active:bg-gray-100"
              >
                Edit
              </button>
            )}

            <button
              type="button"
              onClick={handleGoToPost}
              className="w-full py-3.5 text-gray-900 font-normal hover:bg-gray-50 transition active:bg-gray-100"
            >
              Go to post
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-3.5 text-gray-900 font-normal hover:bg-gray-50 transition active:bg-gray-100"
            >
              Copy link
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 text-gray-600 font-normal hover:bg-gray-50 transition active:bg-gray-100"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleReport}
              className="w-full py-3.5 text-red-600 font-bold hover:bg-red-50 transition active:bg-red-100"
            >
              Report
            </button>

            <button
              type="button"
              onClick={handleToggleFollow}
              className={`w-full py-3.5 ${
                isFollowing ? "text-red-600 font-bold" : "text-[#0095F6] font-bold"
              } hover:bg-gray-50 transition active:bg-gray-100`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>

            <button
              type="button"
              onClick={handleVisitProfile}
              className="w-full py-3.5 text-gray-900 font-normal hover:bg-gray-50 transition active:bg-gray-100"
            >
              About this account
            </button>

            <button
              type="button"
              onClick={handleGoToPost}
              className="w-full py-3.5 text-gray-900 font-normal hover:bg-gray-50 transition active:bg-gray-100"
            >
              Go to post
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-3.5 text-gray-900 font-normal hover:bg-gray-50 transition active:bg-gray-100"
            >
              Copy link
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 text-gray-600 font-normal hover:bg-gray-50 transition active:bg-gray-100"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default OptionsList;

