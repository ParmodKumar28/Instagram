export function UserListSkeleton({ count = 6 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="w-28 h-3.5 bg-gray-200 rounded" />
              <div className="w-20 h-2.5 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="w-20 h-7 bg-gray-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default UserListSkeleton;
