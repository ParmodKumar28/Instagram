export function PostSkeleton() {
  return (
    <div className="w-full max-w-lg mx-auto bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden my-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gray-200" />
          <div className="space-y-1.5">
            <div className="w-24 h-3 bg-gray-200 rounded" />
            <div className="w-16 h-2.5 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="w-5 h-2 bg-gray-200 rounded" />
      </div>

      {/* Media Image Placeholder */}
      <div className="w-full h-80 bg-gray-200" />

      {/* Actions */}
      <div className="flex justify-between items-center px-4 pt-3 pb-2">
        <div className="flex items-center space-x-4">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded" />
      </div>

      {/* Captions */}
      <div className="px-4 pb-4 space-y-2">
        <div className="w-3/4 h-3 bg-gray-200 rounded" />
        <div className="w-1/2 h-3 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default PostSkeleton;
