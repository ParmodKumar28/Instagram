// OptionsList.js
import React from 'react';

function OptionsList({ onDelete, onEdit }) {
    return (
        <div className="absolute top-0 right-8 mt-4 mr-4 bg-white border border-gray-200 rounded-md shadow-md z-10">
            <ul>
                <li className="py-2 px-4 hover:bg-gray-100 cursor-pointer" onClick={onDelete}>Delete Post</li>
                <li className="py-2 px-4 hover:bg-gray-100 cursor-pointer" onClick={onEdit}>Edit Post</li>
            </ul>
        </div>
    );
}

export default OptionsList;
