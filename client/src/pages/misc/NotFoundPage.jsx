import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4 text-center">
      <h1 className="text-8xl md:text-9xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
        404
      </h1>
      <p className="text-2xl md:text-3xl font-semibold mt-4 text-gray-100">
        Oops! Page not found.
      </p>
      <p className="text-sm text-gray-400 mt-2 max-w-sm">
        The link you followed may be broken, or the page may have been removed. Redirecting in a few seconds...
      </p>

      <Link
        to="/"
        className="mt-8 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg transition transform hover:scale-105 text-sm"
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
