import React from 'react';

function OptionsList({ onDelete, onEdit }) {
  return (
    <div className="absolute top-10 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
      <ul className="divide-y divide-gray-200">
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={onDelete}
        >
          Delete Post
        </li>
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={onEdit}
        >
          Edit Post
        </li>
      </ul>
    </div>
  );
}

export default OptionsList;
