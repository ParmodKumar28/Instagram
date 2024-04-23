import { FaHeart, FaRegComment, FaRegBookmark, FaEllipsisH, FaRegPaperPlane } from 'react-icons/fa';

// Post component
function Post({ post }) {
    return (
        <div className="my-2 max-w-md mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
            {/* User Info */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                    <img className="w-10 h-10 rounded-full mr-4" src={post.user.profilePic} alt="User" />
                    <p className="text-sm font-semibold">{post.user.username}</p>
                </div>
                <button className="text-gray-700">
                    <FaEllipsisH className="w-6 h-6" />
                </button>
            </div>

            {/* Post image */}
            {post.media && (
                <img className="w-full" src={post.media} alt="Post" />
            )}

            {/* Post actions */}
            <div className="flex justify-between p-4">
                {/* Like, Comment, Share */}
                <div className="flex items-center">
                    <button className="text-gray-700">
                        <FaHeart className="w-6 h-6" />
                    </button>
                    <button className="text-gray-700 ml-4">
                        <FaRegComment className="w-6 h-6" />
                    </button>
                    <button className="text-gray-700 ml-4">
                        <FaRegPaperPlane className="w-6 h-6" />
                    </button>
                </div>
                {/* Bookmark icon */}
                <button className="text-gray-700">
                    <FaRegBookmark className="w-6 h-6" />
                </button>
            </div>

            {/* Post content */}
            <div className="px-4 pb-2">
                {/* Post caption */}
                <p className="text-gray-800 text-lg font-semibold mb-2">{post.caption}</p>
                {/* Post comments */}
                {post.comments.map((comment, index) => (
                    <div key={index} className="mb-1">
                        <p className="text-gray-600 font-medium">{comment.username}:</p>
                        <p className="text-gray-700">{comment.text}</p>
                    </div>
                ))}
                {/* Add more comments */}
                <a href="#" className="text-blue-500 hover:underline">View all comments</a>
            </div>
        </div>
    );
}

export default Post;
