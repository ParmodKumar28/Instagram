// Imports
import { useState } from "react";
import { createPostAsync, postsSelector } from "../../Redux/Reducer/postsReducer";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

// Component for the new post form
function PostForm() {
    // States
    const [caption, setCaption] = useState("");
    const [media, setMedia] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null); // State for previewing the media
    const [location, setLocation] = useState("");

    // State's from post's reducer
    const { addPostLoad } = useSelector(postsSelector);

    // Dispatcher
    const dispatch = useDispatch();

    // Event handler's
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!media && !caption && !location) {
            return toast.error("Please fill out any field empty post not look good hahaha!");
        }
        const formData = new FormData();
        formData.append('caption', caption);
        formData.append('location', location);
        formData.append('media', media); // Append the actual file object

        // Dispatch action to create post
        dispatch(createPostAsync(formData));

        // Clear form fields after successful submission
        setCaption("");
        setMedia(null);
        setMediaPreview(null);
        setLocation("");
    };

    // On adding media converting it to url
    const handleMediaUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setMedia(url); // Store the file for upload
            setMediaPreview(url); // Store the preview URL
        }
    };

    // Remove selected media
    const handleRemoveMedia = () => {
        setMedia(null);
        setMediaPreview(null);
    };

    // Returning JSX
    return (
        // Form container
        <div className="flex flex-col items-center my-10 p-6 bg-white shadow-lg rounded-lg max-w-2xl mx-auto">
            {/* Heading */}
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Create New Post</h2>
            {/* Heading End's */}

            {/* Form start's */}
            <form className="w-full" onSubmit={handleSubmit}>
                {/* Media uploader container */}
                <div className="mb-6">
                    {/* Media label */}
                    <label htmlFor="media" className="block text-gray-700 text-lg font-medium mb-2">
                        Upload Media:
                    </label>
                    {/* Media label end's */}

                    {/* Media file input */}
                    <input
                        type="file"
                        id="media"
                        accept="image/*,video/*"
                        onChange={handleMediaUpload}
                        className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out transform hover:scale-105"
                    />
                    {/* Media file input end's */}
                </div>
                {/* Media uploader container end's */}

                {/* Display selected media */}
                {mediaPreview && (
                    <div className="mb-6 relative">
                        <img src={mediaPreview} alt="Selected" className="max-w-full w-80 rounded-lg h-auto shadow-md" />
                        <button
                            type="button"
                            onClick={handleRemoveMedia}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-700 focus:outline-none"
                        >
                            &#10005;
                        </button>
                    </div>
                )}
                {/* Display selected media end's */}

                {/* Content container */}
                <div className="mb-6">
                    {/* Content label */}
                    <label htmlFor="caption" className="block text-gray-700 text-lg font-medium mb-2">
                        Caption:
                    </label>
                    {/* Content label end's */}

                    {/* Content textarea */}
                    <textarea
                        name="caption"
                        id="caption"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out transform hover:scale-105"
                        placeholder="Write a caption..."
                    ></textarea>
                    {/* Content textarea end's */}
                </div>
                {/* Content container end's */}

                {/* Location container */}
                <div className="mb-6">
                    {/* Location label */}
                    <label htmlFor="location" className="block text-gray-700 text-lg font-medium mb-2">
                        Location:
                    </label>
                    {/* Location label end's */}

                    {/* Location input */}
                    <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out transform hover:scale-105"
                        placeholder="Add a location"
                    />
                    {/* Location input end's */}
                </div>
                {/* Location container end's */}

                {/* Submit button container */}
                <div className="flex justify-center">
                    {/* Submit button */}
                    <button
                        type="submit"
                        className="bg-gradient-to-r w-52 from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transform transition-transform duration-300 hover:scale-105"
                    >
                        {addPostLoad ? <ClipLoader color={"#ffffff"} loading={true} size={20} /> : "Post"}
                    </button>
                    {/* Submit button end's */}
                </div>
                {/* Submit button container end's */}
            </form>
            {/* Form end's */}
        </div>
        // Form container end's
    );
}

// Exporting PostForm
export default PostForm;
