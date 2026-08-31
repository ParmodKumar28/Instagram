import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoClose, IoArrowBack, IoPersonOutline } from "react-icons/io5";
import { BsImages, BsEmojiSmile } from "react-icons/bs";
import { CiLocationOn } from "react-icons/ci";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { createPostAsync, fetchPostsAsync, fetchUserPostsAsync, postsSelector } from "../../redux/slices/postsSlice";
import { usersSelector } from "../../redux/slices/usersSlice";
import { userService } from "../../services";
import Avatar from "../common/Avatar";
import EmojiDrawer from "../common/EmojiDrawer";

export function CreatePostModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { addPostLoad } = useSelector(postsSelector);
  const { signedUser } = useSelector(usersSelector);

  const [step, setStep] = useState("select"); // 'select' | 'edit'
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [taggedUsers, setTaggedUsers] = useState([]); // [{ _id, username, name, profilePic, gender }]
  const [tagQuery, setTagQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingTags, setIsSearchingTags] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (!tagQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingTags(true);
      try {
        const res = await userService.searchUsers(tagQuery);
        if (res.data?.users) {
          const filtered = res.data.users.filter(
            (u) =>
              u._id !== signedUser?._id &&
              !taggedUsers.some((tagged) => tagged._id === u._id)
          );
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error("Failed to search users for tags:", err);
      } finally {
        setIsSearchingTags(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [tagQuery, signedUser?._id, taggedUsers]);

  if (!isOpen) return null;

  const resetState = () => {
    setStep("select");
    setMediaFile(null);
    setMediaPreview(null);
    setCaption("");
    setLocation("");
    setTaggedUsers([]);
    setTagQuery("");
    setSearchResults([]);
    setShowTagInput(false);
    setIsDragOver(false);
    setShowDiscardConfirm(false);
  };

  const handleClose = () => {
    if (mediaFile || caption.trim() || taggedUsers.length > 0) {
      setShowDiscardConfirm(true);
    } else {
      resetState();
      onClose();
    }
  };

  const confirmDiscard = () => {
    resetState();
    onClose();
  };

  const handleFileSelection = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      return toast.error("Please upload an image or video file.");
    }
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setStep("edit");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleAddTag = (user) => {
    if (!taggedUsers.some((u) => u._id === user._id)) {
      setTaggedUsers((prev) => [...prev, user]);
    }
    setTagQuery("");
    setSearchResults([]);
  };

  const handleRemoveTag = (userId) => {
    setTaggedUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  const handleSubmit = async () => {
    if (!mediaFile && !caption.trim() && !location.trim()) {
      return toast.error("Please add media or caption to create a post.");
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("location", location);
    if (taggedUsers.length > 0) {
      formData.append(
        "tags",
        JSON.stringify(taggedUsers.map((u) => u._id))
      );
    }
    if (mediaFile) {
      formData.append("media", mediaFile);
    }

    try {
      await dispatch(createPostAsync(formData)).unwrap();
      toast.success("Your post has been shared.");
      dispatch(fetchPostsAsync());
      if (signedUser?._id) {
        dispatch(fetchUserPostsAsync(signedUser._id));
      }
      resetState();
      onClose();
    } catch {
      // Error handled in slice
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/65 flex items-center justify-center p-3 sm:p-4 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={handleClose}
    >
      {/* Top right close button */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:text-gray-300 text-2xl sm:text-3xl focus:outline-none p-1 z-[100]"
        aria-label="Close modal"
      >
        <IoClose />
      </button>

      {/* Main Modal Card */}
      <div
        className={`bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 select-none relative ${
          step === "edit"
            ? "w-full max-w-[850px] h-[92dvh] sm:h-[580px] max-h-[92dvh]"
            : "w-full max-w-[480px] h-[400px] sm:h-[480px]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-11 px-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-white">
          {step === "edit" ? (
            <button
              onClick={() => setStep("select")}
              className="text-gray-900 hover:text-gray-600 p-1 -ml-1 text-xl"
              aria-label="Back"
            >
              <IoArrowBack />
            </button>
          ) : (
            <div className="w-6" />
          )}

          <h3 className="font-semibold text-sm text-gray-900">
            {step === "select" ? "Create new post" : "Create new post"}
          </h3>

          {step === "edit" ? (
            <button
              onClick={handleSubmit}
              disabled={addPostLoad}
              className="text-[#0095F6] hover:text-[#1877F2] font-semibold text-sm disabled:opacity-50 transition"
            >
              {addPostLoad ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#0095F6]" />
              ) : (
                "Share"
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}
        </div>

        {/* Modal Body */}
        {step === "select" ? (
          /* Step 1: Media Dropzone */
          <div
            className={`flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center transition ${
              isDragOver ? "bg-gray-50 border-2 border-dashed border-[#0095F6]" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="mb-4">
              <BsImages className="text-5xl sm:text-6xl text-gray-800 stroke-[0.2]" />
            </div>

            <p className="text-lg sm:text-xl text-gray-800 font-light mb-5">
              Drag photos and videos here
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#0095F6] hover:bg-[#1877F2] text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm"
            >
              Select from computer
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => handleFileSelection(e.target.files?.[0])}
            />
          </div>
        ) : (
          /* Step 2: 2-Column Caption & Preview Layout */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            {/* Left: Media Viewport */}
            <div className="w-full md:w-[58%] h-[240px] sm:h-[300px] md:h-full bg-black flex items-center justify-center relative overflow-hidden flex-shrink-0">
              {mediaFile?.type?.startsWith("video/") ? (
                <video
                  src={mediaPreview}
                  controls
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Post preview"
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            {/* Right: Caption & Settings Drawer */}
            <div className="w-full md:w-[42%] bg-white flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 overflow-y-auto flex-1 min-h-0">
              <div>
                {/* Author row */}
                <div className="flex items-center space-x-2.5 p-3 sm:p-4">
                  <Avatar
                    src={signedUser?.profilePic}
                    alt={signedUser?.username || "User"}
                    gender={signedUser?.gender}
                    username={signedUser?.username}
                    className="w-7 h-7 rounded-full object-cover border border-gray-200"
                  />
                  <span className="font-semibold text-xs text-gray-900">
                    {signedUser?.username || "user"}
                  </span>
                </div>

                {/* Caption Textarea */}
                <div className="px-4">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    rows={6}
                    maxLength={2200}
                    className="w-full text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none"
                  />
                  <div className="relative flex justify-between items-center text-gray-400 text-xs py-2 border-b border-gray-100">
                    <button
                      type="button"
                      data-emoji-trigger="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEmojiPicker((prev) => !prev);
                      }}
                      className={`hover:text-gray-700 p-0.5 text-lg transition cursor-pointer ${
                        showEmojiPicker ? "text-[#0095F6]" : ""
                      }`}
                      aria-label="Add emoji"
                      title="Add emoji"
                    >
                      <BsEmojiSmile />
                    </button>

                    <EmojiDrawer
                      isOpen={showEmojiPicker}
                      onClose={() => setShowEmojiPicker(false)}
                      onEmojiSelect={(emoji) => setCaption((prev) => prev + emoji)}
                      position="bottom-left"
                      width={310}
                      height={350}
                    />

                    <span>{caption.length}/2,200</span>
                  </div>
                </div>

                {/* Add Location */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location"
                    className="text-sm text-gray-900 placeholder-gray-400 focus:outline-none w-full mr-2"
                  />
                  <CiLocationOn className="text-gray-400 text-xl flex-shrink-0" />
                </div>

                {/* Tag People */}
                <div className="px-4 py-3 border-b border-gray-100 relative">
                  <div
                    className="flex items-center justify-between cursor-pointer select-none"
                    onClick={() => setShowTagInput((prev) => !prev)}
                  >
                    <span className="text-sm text-gray-900">
                      Tag People {taggedUsers.length > 0 && `(${taggedUsers.length})`}
                    </span>
                    <IoPersonOutline className="text-gray-400 text-lg flex-shrink-0" />
                  </div>

                  {/* Tagged users chips */}
                  {taggedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {taggedUsers.map((user) => (
                        <span
                          key={user._id}
                          className="inline-flex items-center space-x-1.5 bg-gray-100 text-gray-900 text-xs px-2.5 py-1 rounded-full border border-gray-200"
                        >
                          <Avatar
                            src={user.profilePic}
                            alt={user.username}
                            gender={user.gender}
                            username={user.username}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="font-medium">@{user.username}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveTag(user._id);
                            }}
                            className="text-gray-400 hover:text-gray-700 ml-0.5"
                          >
                            <IoClose className="text-xs" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Search Tagged Users Input & Dropdown */}
                  {showTagInput && (
                    <div className="mt-2.5 space-y-1 relative">
                      <input
                        type="text"
                        value={tagQuery}
                        onChange={(e) => setTagQuery(e.target.value)}
                        placeholder="Search by username..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0095F6]"
                        autoFocus
                      />

                      {isSearchingTags && (
                        <div className="py-2 text-center text-xs text-gray-400">
                          Searching...
                        </div>
                      )}

                      {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 max-h-48 overflow-y-auto divide-y divide-gray-50">
                          {searchResults.map((user) => (
                            <div
                              key={user._id}
                              onClick={() => handleAddTag(user)}
                              className="flex items-center space-x-2.5 p-2 hover:bg-gray-50 cursor-pointer transition"
                            >
                              <Avatar
                                src={user.profilePic}
                                alt={user.username}
                                gender={user.gender}
                                username={user.username}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-gray-900 truncate">
                                  {user.username}
                                </span>
                                {user.name && (
                                  <span className="text-[11px] text-gray-500 truncate">
                                    {user.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {tagQuery.trim() &&
                        !isSearchingTags &&
                        searchResults.length === 0 && (
                          <div className="py-2 text-center text-xs text-gray-400">
                            No users found
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Sharing indicator if uploading */}
              {addPostLoad && (
                <div className="p-4 bg-gray-50 flex items-center justify-center space-x-2 border-t border-gray-100">
                  <Loader2 className="w-4 h-4 animate-spin text-[#0095F6]" />
                  <span className="text-xs font-semibold text-gray-700">
                    Sharing your post...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Discard Post Confirmation Dialog */}
      {showDiscardConfirm && (
        <div
          className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-2xl max-w-[340px] w-full overflow-hidden shadow-2xl text-center">
            <div className="p-6">
              <h4 className="font-bold text-base text-gray-900 mb-1">Discard post?</h4>
              <p className="text-xs text-gray-500">
                If you leave, your edits won&apos;t be saved.
              </p>
            </div>
            <div className="border-t border-gray-100 flex flex-col">
              <button
                onClick={confirmDiscard}
                className="py-3 text-sm font-bold text-red-500 hover:bg-gray-50 active:bg-gray-100 transition border-b border-gray-100"
              >
                Discard
              </button>
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="py-3 text-sm text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreatePostModal;
