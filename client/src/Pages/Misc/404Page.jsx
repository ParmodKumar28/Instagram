// Imports
import { useEffect } from "react";
import { Link } from "react-router-dom"; // Assuming you're using React Router
import { useNavigate } from "react-router-dom";

// 404 Error component
function NotFound() {
  // Navigator
  const navigate = useNavigate();

  // Redirect to home after 5 seconds
  useEffect(() => {
    setTimeout(() => {
      navigate("/");
    }, 5000);
  }, []);

  // Returning JSX
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      {/* Animated background */}
      <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/instagram-background.jpg')" }}></div>

      {/* Content */}
      <h1 className="text-8xl font-bold z-10">404</h1>
      <p className="text-2xl mt-4 z-10">Oops! This page doesn't exist.</p>

      {/* Stylish button */}
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-lg shadow-lg transform hover:scale-105 transition duration-300 z-10"
      >
        Go Home
      </Link>
    </div>
  );
}

// Exporting NotFound
export default NotFound;