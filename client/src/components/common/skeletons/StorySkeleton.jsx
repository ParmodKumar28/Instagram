export function StorySkeleton({ count = 5 }) {
  return (
    <div className="flex space-x-4 overflow-x-auto py-3 px-2 bg-white border border-gray-200 rounded-xl mb-4 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col items-center space-y-1.5 flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gray-200" />
          <div className="w-12 h-2.5 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

export default StorySkeleton;
