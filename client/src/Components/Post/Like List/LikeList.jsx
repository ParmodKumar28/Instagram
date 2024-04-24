import React from 'react';

const LikeList = ({ likeList }) => {
    return (
        <div className="px-4 py-2">
            <h3 className="text-gray-800 font-semibold mb-2">Likes</h3>
            <ul>
                {likeList.map((like, index) => (
                    <li key={index} className="flex items-center mb-2">
                        <img className="w-8 h-8 rounded-full mr-2" src={like.user.profilePic} alt="User" />
                        <p className="text-gray-600">{like.user.name}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LikeList;
