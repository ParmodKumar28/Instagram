import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createPostAsync, postsSelector } from "../../redux/slices/postsSlice";
import { Loader2, X, MapPin, Upload, Send } from "lucide-react";
import { toast } from "react-hot-toast";

export function CreatePostPage() {
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [location, setLocation] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const { addPostLoad } = useSelector(postsSelector);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!media && !caption.trim() && !location.trim()) {
      return toast.error("Please add media, caption, or location!");
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("location", location);
    if (media) {
      formData.append("media", media);
    }

    try {
      await dispatch(createPostAsync(formData)).unwrap();
      navigate("/");
    } catch {
      // Error handled in slice
    }
  };

  const handleMediaUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMedia(file);
      setMediaPreview(url);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setMedia(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveMedia = () => {
    setMedia(null);
    setMediaPreview(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-2">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 py-4 px-6 text-center">
          <h2 className="text-xl font-bold text-white">Create New Post</h2>
        </div>

        <div className="p-6">
          {/* Media Upload Area */}
          {!mediaPreview ? (
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 mb-6 flex flex-col items-center justify-center cursor-pointer transition duration-200 ${
                dragActive
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-300 hover:border-purple-400 bg-gray-50 hover:bg-gray-100"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="media"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload size={40} className="text-gray-400 mb-3" />
              <p className="text-sm font-medium text-center text-gray-700">
                Drag and drop photos or videos here, or{" "}
                <span className="text-purple-600 font-semibold">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Supports high-res images and videos</p>
            </div>
          ) : (
            <div className="relative mb-6 flex justify-center bg-black rounded-xl overflow-hidden max-h-96">
              <img
                src={mediaPreview}
                alt="Preview"
                className="max-h-96 object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveMedia}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition"
                aria-label="Remove media"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Caption */}
          <div className="mb-4">
            <label
              htmlFor="caption"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
            >
              Caption
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm resize-none"
              rows={3}
            />
          </div>

          {/* Location */}
          <div className="mb-6">
            <label
              htmlFor="location"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1"
            >
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MapPin size={16} />
              </div>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add a location"
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={addPostLoad}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none transition disabled:opacity-60 flex justify-center items-center space-x-2 text-sm"
            >
              {addPostLoad ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Send size={16} />
                  <span>Share Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePostPage;
