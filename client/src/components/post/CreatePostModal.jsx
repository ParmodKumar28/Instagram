import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoClose, IoArrowBack } from "react-icons/io5";
import { BsImages, BsEmojiSmile } from "react-icons/bs";
import { CiLocationOn } from "react-icons/ci";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { createPostAsync, fetchPostsAsync, fetchUserPostsAsync, postsSelector } from "../../redux/slices/postsSlice";
import { usersSelector } from "../../redux/slices/usersSlice";
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
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setStep("select");
    setMediaFile(null);
    setMediaPreview(null);
    setCaption("");
    setLocation("");
    setIsDragOver(false);
    setShowDiscardConfirm(false);
  };

  const handleClose = () => {
    if (mediaFile || caption.trim()) {
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

  const handleSubmit = async () => {
    if (!mediaFile && !caption.trim() && !location.trim()) {
      return toast.error("Please add media or caption to create a post.");
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("location", location);
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
      className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={handleClose}
    >
      {/* Top right close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl focus:outline-none p-1 z-50"
        aria-label="Close modal"
      >
        <IoClose />
      </button>

      {/* Main Modal Card */}
      <div
        className={`bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 select-none relative ${
          step === "edit"
            ? "w-full max-w-[850px] h-[580px] max-h-[90vh]"
            : "w-full max-w-[480px] h-[480px]"
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
            className={`flex-1 flex flex-col items-center justify-center p-8 text-center transition ${
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
              <BsImages className="text-6xl text-gray-800 stroke-[0.2]" />
            </div>

            <p className="text-xl text-gray-800 font-light mb-5">
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
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left: Media Viewport */}
            <div className="w-full md:w-[60%] bg-black flex items-center justify-center relative overflow-hidden h-full">
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
            <div className="w-full md:w-[40%] bg-white flex flex-col justify-between border-l border-gray-100 overflow-y-auto">
              <div>
                {/* Author row */}
                <div className="flex items-center space-x-3 p-4">
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
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                      className={`hover:text-gray-700 p-0.5 text-lg transition ${
                        showEmojiPicker ? "text-[#0095F6]" : ""
                      }`}
                      aria-label="Add emoji"
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
