export function ProfileSkeleton() {
  return (
    <div className="min-h-screen py-4 animate-pulse">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner + Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-36 bg-gray-200" />
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gray-300 border-4 border-white" />
              <div className="md:ml-6 mt-4 md:mt-0 flex-1 space-y-2">
                <div className="w-40 h-5 bg-gray-200 rounded" />
                <div className="w-28 h-3 bg-gray-200 rounded" />
                <div className="w-64 h-3 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex justify-around md:justify-start md:space-x-10 border-t border-b border-gray-100 py-3 -mx-6 px-6">
              <div className="w-12 h-6 bg-gray-200 rounded" />
              <div className="w-16 h-6 bg-gray-200 rounded" />
              <div className="w-16 h-6 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* 3x3 Grid of Post Skeletons */}
        <div className="grid grid-cols-3 gap-1 sm:gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square bg-gray-200 rounded-md sm:rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProfileSkeleton;
