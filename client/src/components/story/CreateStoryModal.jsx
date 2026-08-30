import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createStoryAsync,
  fetchFeedStoriesAsync,
  storiesSelector,
} from "../../redux/slices/storiesSlice";
import { usersSelector } from "../../redux/slices/usersSlice";
import {
  IoClose,
  IoImagesOutline,
  IoCloudUploadOutline,
  IoSparkles,
} from "react-icons/io5";
import { Loader2 } from "lucide-react";
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";

export function CreateStoryModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { signedUser } = useSelector(usersSelector);
  const { creating } = useSelector(storiesSelector);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Please select an image or video file");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be under 25MB");
      return;
    }

    setSelectedFile(file);
    setMediaType(file.type.startsWith("video/") ? "video" : "image");
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select a photo or video for your story");
      return;
    }

    const formData = new FormData();
    formData.append("media", selectedFile);
    formData.append("mediaType", mediaType);
    if (caption.trim()) {
      formData.append("caption", caption.trim());
    }

    try {
      await dispatch(createStoryAsync(formData)).unwrap();
      dispatch(fetchFeedStoriesAsync());
      handleClose();
    } catch (err) {
      console.error("Story upload failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#FD1D1D] to-[#F56040]" />
            <h2 className="text-sm font-bold text-gray-900">Add to Story</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full transition cursor-pointer"
            aria-label="Close"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center">
          {!previewUrl ? (
            /* Upload Dropzone */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[9/14] max-w-[280px] border-2 border-dashed border-gray-300 hover:border-[#E1306C] rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition group bg-gray-50/50 hover:bg-pink-50/30"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-full bg-pink-100 text-[#E1306C] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <IoImagesOutline className="text-2xl" />
              </div>

              <p className="text-sm font-bold text-gray-800 mb-1">
                Select media for your story
              </p>
              <p className="text-xs text-gray-400 max-w-[200px]">
                Supports photos and videos up to 24 hours
              </p>

              <button
                type="button"
                className="mt-4 px-4 py-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white text-xs font-semibold rounded-xl shadow-xs pointer-events-none"
              >
                Choose from device
              </button>
            </div>
          ) : (
            /* Preview Area */
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="relative w-full aspect-[9/14] max-w-[280px] bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex items-center justify-center">
                {mediaType === "video" ? (
                  <video
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    muted
                    loop
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Story preview"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* User Header overlay on preview */}
                <div className="absolute top-3 left-3 flex items-center space-x-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs">
                  <Avatar
                    src={signedUser?.profilePic}
                    alt={signedUser?.username}
                    gender={signedUser?.gender}
                    username={signedUser?.username}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="font-semibold">{signedUser?.username}</span>
                </div>

                {/* Change media button */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white p-1.5 rounded-full transition cursor-pointer"
                  title="Change media"
                >
                  <IoClose className="text-sm" />
                </button>
              </div>

              {/* Caption Input */}
              <div className="w-full max-w-[280px]">
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  className="w-full bg-gray-100 text-gray-900 text-xs rounded-xl px-3.5 py-2.5 outline-none border border-transparent focus:border-gray-300 transition"
                  maxLength={100}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <button
            type="button"
            onClick={handleClose}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-3 py-2 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!selectedFile || creating}
            onClick={handleSubmit}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
          >
            {creating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sharing...</span>
              </>
            ) : (
              <>
                <IoSparkles className="text-sm" />
                <span>Share to Story</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateStoryModal;
