import React from 'react';
import { Link } from 'react-router-dom';

const LikeList = ({ likeList }) => {
    return (
        <div className="px-4 py-2">
            <h3 className="text-gray-800 font-semibold mb-2">Likes</h3>
            <ul>
                {likeList.map((like, index) => (
                    <Link key={index} to={`/profile/${like.user._id}`}>
                        <li key={index} className="flex items-center mb-2">
                            <img className="w-8 h-8 rounded-full mr-2" src={like.user.profilePic} alt="User" />
                            <p className="text-gray-600">{like.user.name}</p>
                        </li>
                    </Link>
                ))}
            </ul>
        </div>
    );
};

export default LikeList;
