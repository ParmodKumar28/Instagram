import { Link } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import Avatar from "../common/Avatar";

export function LikeList({ likeList = [], onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-11/12 md:w-96 z-50 p-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-lg font-bold text-gray-900">Likes</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {likeList && likeList.length > 0 ? (
            likeList.map((like, index) => (
              <li
                key={like._id || index}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Link
                  to={`/profile/${like.user?._id}`}
                  onClick={onClose}
                  className="flex items-center space-x-3 w-full"
                >
                  <Avatar
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    src={like.user?.profilePic}
                    alt={like.user?.name || "User"}
                    gender={like.user?.gender}
                    username={like.user?.username || like.user?.name}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      {like.user?.username || like.user?.name || "User"}
                    </span>
                    <span className="text-xs text-gray-500">{like.user?.name}</span>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <p className="text-center text-sm text-gray-500 py-6">No likes yet</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default LikeList;
