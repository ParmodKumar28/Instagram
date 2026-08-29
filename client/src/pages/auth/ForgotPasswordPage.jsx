import { useState } from "react";
import { CiLock } from "react-icons/ci";
import { IoArrowBack } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { forgotPasswordOtpAsync } from "../../redux/slices/usersSlice";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    dispatch(forgotPasswordOtpAsync({ email }));
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between items-center py-6 px-4">
      {/* Top Brand Nav */}
      <nav className="w-full max-w-4xl flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
        <Link
          to="/"
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: "Lobster Two, cursive" }}
        >
          Instagram
        </Link>
      </nav>

      {/* Main Container */}
      <div className="w-full max-w-sm bg-white border border-gray-300 rounded-xl shadow-sm flex flex-col items-center p-8">
        {/* Lock Icon */}
        <div className="border-2 border-gray-800 rounded-full p-4 mb-4">
          <CiLock className="text-5xl text-gray-800" />
        </div>

        <h2 className="font-bold text-gray-900 text-base mb-1">
          Trouble with logging in?
        </h2>
        <p className="text-center text-xs text-gray-500 mb-6 leading-relaxed">
          Enter your email address and we'll send you an OTP to reset and get back into your account.
        </p>

        <form onSubmit={handleSendEmail} className="w-full flex flex-col space-y-3">
          <input
            className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={!email.trim()}
            className="bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-semibold rounded-lg py-2 text-sm transition shadow-sm"
          >
            Send Reset Link
          </button>
        </form>

        <div className="flex items-center my-6 w-full">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-3 text-xs font-semibold text-gray-400">OR</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        <Link
          to="/sign-up"
          className="text-xs font-semibold text-gray-900 hover:text-gray-600"
        >
          Create new account
        </Link>

        {/* Back to Login */}
        <div className="w-full mt-8 pt-4 border-t border-gray-100 flex justify-center items-center">
          <Link
            to="/login"
            className="flex items-center space-x-1.5 text-xs font-semibold text-gray-700 hover:text-black"
          >
            <IoArrowBack className="text-base" />
            <span>Back to login</span>
          </Link>
        </div>
      </div>

      <footer className="mt-8 text-xs text-gray-400">
        © 2026 Instagram from Meta
      </footer>
    </div>
  );
}

export default ForgotPasswordPage;
