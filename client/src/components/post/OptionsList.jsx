export function OptionsList({ onDelete, onEdit }) {
  return (
    <div className="mx-2 my-2 absolute top-10 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
      <ul className="divide-y divide-gray-100 text-sm">
        <li
          className="px-4 py-2 hover:bg-red-50 text-red-600 font-medium cursor-pointer transition-colors"
          onClick={onDelete}
        >
          Delete Post
        </li>
        <li
          className="px-4 py-2 hover:bg-gray-50 text-gray-700 cursor-pointer transition-colors"
          onClick={onEdit}
        >
          Edit Post
        </li>
      </ul>
    </div>
  );
}

export default OptionsList;
