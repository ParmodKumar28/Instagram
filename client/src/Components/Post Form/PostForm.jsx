// Import's
import { useState } from "react";
import { createPostAsync, postsSelector } from "../../Redux/Reducer/postsReducer";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";

// Component for the new post form
function PostForm() {
    // States
    const [caption, setCaption] = useState("");
    const [media, setMedia] = useState(null);
    const [location, setLocation] = useState("");

    // State's from post's reducer
    const { addPostLoad } = useSelector(postsSelector);
    // Dispatcher
    const dispatch = useDispatch();

    // Event handler's
    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('caption', caption);
        formData.append('location', location);
        formData.append('media', media);

        // Dispatch action to create post
        dispatch(createPostAsync(formData));

        // Clear form fields after successful submission
        setCaption("");
        setMedia(null);
        setLocation("");
    };

    // On adding media converting it to url
    const handlemediaUpload = (event) => {
        setMedia(event.target.files[0]);
    };

    // Returning Jsx
    return (
        // Form container
        <div className="flex flex-col items-center mt-10">
            {/* Heading */}
            <h2 className="text-2xl font-semibold mb-4">Add New Post</h2>
            {/* Heading End's */}

            {/* Form start's */}
            <form className="w-full max-w-lg" onSubmit={(event) => handleSubmit(event)}>
                {/* media uploader container */}
                <div className="mb-4">
                    {/* media label */}
                    <label
                        htmlFor="media"
                        className="block text-gray-700 text-sm font-bold mb-2"
                    >
                        media:
                    </label>
                    {/* media label end's */}

                    {/* media file input */}
                    <input
                        type="file"
                        id="media"
                        onChange={(event) => handlemediaUpload(event)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                    {/* media file input end's */}
                </div>
                {/* media uploader container end's */}

                {/* Content container */}
                <div className="mb-4">
                    {/* Content label */}
                    <label
                        htmlFor="content"
                        className="block text-gray-700 text-sm font-bold mb-2"
                    >
                        Content:
                    </label>
                    {/* Content label end's */}

                    {/* Content textarea */}
                    <textarea
                        name="caption"
                        id="caption"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    ></textarea>
                    {/* Content textarea end's */}
                </div>
                {/* Content container end's*/}

                {/* Location container */}
                <div className="mb-4">
                    {/* Location label */}
                    <label
                        htmlFor="location"
                        className="block text-gray-700 text-sm font-bold mb-2"
                    >
                        Location:
                    </label>
                    {/* Location label end's */}

                    {/* Location input */}
                    <input
                        name="location"
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    {/* Location input end's */}
                </div>
                {/* Location container end's */}

                {/* Submit button container */}
                <div className="flex justify-center">
                    {/* Submit button */}
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline min-w-52"
                    >
                        {addPostLoad ? (<ClipLoader color={"#ffffff"} loading={true} size={20} />) : ("Add Post")}
                    </button>
                    {/* Submit button end's */}
                </div>
                {/* Submit button container end's */}

            </form>
            {/* Form start's */}
        </div>
        // Form container end's
    );
}

// Exporting PostForm
export default PostForm;
