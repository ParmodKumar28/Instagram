import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { usersSelector } from "../../redux/slices/usersSlice";
import { InstagramLogo } from "../../components/common/InstagramLogo";

export function NotFoundPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(8);
  const { userId } = useSelector(usersSelector);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center items-center text-gray-900 px-4 py-8 select-none">
      {/* Top Brand Header */}
      <div className="mb-8">
        <Link to="/" aria-label="Go to Instagram Feed">
          <InstagramLogo size="text-4xl" />
        </Link>
      </div>

      {/* Main 404 Error Content */}
      <main className="flex flex-col items-center text-center max-w-lg w-full mx-auto py-12 px-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
        {/* Visual Icon Illustration */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[3px] flex items-center justify-center animate-pulse">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                width="34"
                height="34"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-gray-800"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
            404
          </span>
        </div>

        {/* Copy */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Sorry, this page isn&apos;t available.
        </h1>

        <p className="text-sm md:text-base text-gray-500 mt-3 leading-relaxed max-w-md">
          The link you followed may be broken, or the page may have been removed.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full">
          <Link
            to="/"
            className="w-full sm:flex-1 py-2.5 px-5 bg-[#0095F6] hover:bg-[#1877F2] text-white font-semibold text-sm rounded-xl transition duration-150 shadow-sm flex items-center justify-center"
          >
            Go back to Instagram
          </Link>

          {userId && (
            <Link
              to={`/profile/${userId}`}
              className="w-full sm:flex-1 py-2.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm rounded-xl transition duration-150 flex items-center justify-center"
            >
              View Profile
            </Link>
          )}
        </div>

        {/* Automatic Redirect Notice */}
        <p className="text-xs text-gray-400 mt-6 font-normal">
          Redirecting to home in <span className="font-semibold text-gray-600">{countdown}s</span>
        </p>
      </main>
    </div>
  );
}

export default NotFoundPage;
