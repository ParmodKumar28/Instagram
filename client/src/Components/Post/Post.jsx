// Imports
import { FaHeart, FaRegComment, FaRegBookmark, FaEllipsisH } from 'react-icons/fa'; // Import icons from react-icons library

// Post component
function Post({ post }) {
    return (
        <div className="m-auto mb-5 max-w-sm bg-white shadow-lg rounded-lg overflow-hidden">
            {/* User Info */}
            <div className="flex items-center p-4">
                <img className="w-10 h-10 rounded-full" src={post.user.profilePicture || "https://static.vecteezy.com/system/resources/previews/005/005/788/original/user-icon-in-trendy-flat-style-isolated-on-grey-background-user-symbol-for-your-web-site-design-logo-app-ui-illustration-eps10-free-vector.jpg"} alt="User" />
                <p className="ml-4 text-sm font-semibold">{post.user.username}</p>
                <button className="ml-auto text-gray-700">
                    <FaEllipsisH className="w-6 h-6" />
                </button>
            </div>

            {/* Post image */}
            <img className="w-full h-auto" src={post.media || "https://via.placeholder.com/500"} alt="Post" />

            {/* Post actions */}
            <div className="flex justify-between p-4">
                {/* Like icon */}
                <button className="text-gray-700">
                    <FaHeart className="w-6 h-6" />
                    <span className="ml-2 text-sm">{post.likes.length}</span>
                </button>
                {/* Comment icon */}
                <button className="text-gray-700">
                    <FaRegComment className="w-6 h-6" />
                    <span className="ml-2 text-sm">{post.comments.length}</span>
                </button>
                {/* Bookmark icon */}
                <button className="text-gray-700">
                    <FaRegBookmark className="w-6 h-6" />
                </button>
            </div>

            {/* Post content */}
            <div className="p-4">
                {/* Post caption */}
                <p className="text-gray-800 text-lg font-semibold mb-2">{post.caption}</p>
                {/* Post comments */}
                <div>
                    <p className="text-gray-600 font-medium">Username:</p>
                    <p className="text-gray-700">Comment text</p>
                </div>
                {/* Add more comments */}
                <a href="#" className="text-blue-500 hover:underline">View all comments</a>
            </div>
        </div>
    );
}

// Exporting Post
export default Post;
