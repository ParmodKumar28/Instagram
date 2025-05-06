import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

const LikeList = ({ likeList, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 w-11/12 md:w-96 lg:w-96 z-50 p-4 sm:p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg md:text-2xl font-semibold text-gray-800">Likes</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <FaTimes className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
        <ul className="space-y-3 max-h-80 overflow-y-auto">
          {likeList.map((like, index) => (
            <li
              key={index}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Link
                to={`/profile/${like.user._id}`}
                onClick={onClose} // Close the popup when clicking a profile
                className="flex items-center space-x-3"
              >
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  src={like.user.profilePic}
                  alt="User"
                />
                <span className="text-gray-700 text-base font-medium">{like.user.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LikeList;
