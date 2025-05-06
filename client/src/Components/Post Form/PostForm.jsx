import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPostAsync, postsSelector } from "../../Redux/Reducer/postsReducer";
import { Loader2, X, MapPin, Upload, Send } from "lucide-react";
import { toast } from "react-toastify";

function PostForm() {
  // States
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [location, setLocation] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Redux state
  const { addPostLoad } = useSelector(postsSelector);
  const dispatch = useDispatch();

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!media && !caption && !location) {
      return toast.error("Please add media, caption, or location to create a post!");
    }
    
    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('location', location);
    formData.append('media', media);

    dispatch(createPostAsync(formData));

    // Reset form
    setCaption("");
    setMedia(null);
    setMediaPreview(null);
    setLocation("");
  };

  // Handle media upload
  const handleMediaUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            // Set the uploaded image
            setMedia(reader.result);
        };
        reader.readAsDataURL(file);
        const url = URL.createObjectURL(file);
        // setMedia(url);
        setMediaPreview(url);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
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

  // Remove selected media
  const handleRemoveMedia = () => {
    setMedia(null);
    setMediaPreview(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 py-4 px-6">
          <h2 className="text-2xl font-bold text-white">Create New Post</h2>
        </div>

        {/* Form */}
        <div className="p-6">
          {/* Media Upload Area */}
          {!mediaPreview ? (
            <div 
              className={`relative border-2 border-dashed rounded-lg p-8 mb-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${dragActive ? "border-purple-500 bg-purple-50 dark:bg-gray-700" : "border-gray-300 hover:border-purple-400"}`}
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
              <p className="text-sm text-center text-gray-500 dark:text-gray-300">
                Drag and drop media here, or <span className="text-purple-500 font-medium">click to browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">Supports images and videos</p>
            </div>
          ) : (
            <div className="relative mb-6 flex justify-center">
              <img src={mediaPreview} alt="Preview" className="rounded-lg max-h-80 object-contain" />
              <button
                type="button"
                onClick={handleRemoveMedia}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                aria-label="Remove media"
              >
                <X size={16} />
              </button>
            </div>
          )}
          
          {/* Caption Area */}
          <div className="mb-5">
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Caption
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white"
              rows="3"
            />
          </div>
          
          {/* Location Area */}
          <div className="mb-6">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add a location"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={addPostLoad}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium py-3 px-8 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transform transition-all duration-300 hover:-translate-y-1 disabled:opacity-70 flex items-center space-x-2"
            >
              {addPostLoad ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Send size={18} />
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

export default PostForm;