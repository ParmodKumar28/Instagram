import { useState } from "react";
import { FaEye } from "react-icons/fa";
import { RiEyeCloseFill } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { resetPasswordAsync } from "../../redux/slices/usersSlice";

export function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword || !otp) return;
    try {
      await dispatch(
        resetPasswordAsync({ newPassword, confirmPassword, otp })
      ).unwrap();
      navigate("/login");
    } catch {
      // Handled in thunk
    }
  };

  const isFormValid =
    newPassword && confirmPassword && newPassword === confirmPassword && otp;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between items-center py-6 px-4">
      {/* Top Nav */}
      <nav className="w-full max-w-4xl flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
        <Link
          to="/"
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: "Lobster Two, cursive" }}
        >
          Instagram
        </Link>
        <div className="flex space-x-3">
          <Link
            to="/login"
            className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition"
          >
            Log in
          </Link>
          <Link
            to="/sign-up"
            className="text-sky-500 text-xs font-semibold px-3 py-1.5 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <div className="w-full max-w-sm bg-white border border-gray-300 rounded-xl shadow-sm flex flex-col items-center p-8">
        <h2 className="font-bold text-gray-900 text-base mb-1">
          Create a strong password
        </h2>
        <p className="text-center text-xs text-gray-500 mb-6 leading-relaxed">
          Your password must be at least 6 characters and include a combination of numbers, letters, and special characters.
        </p>

        <form onSubmit={handleResetPassword} className="w-full flex flex-col space-y-3">
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
            name="otp"
            placeholder="Enter OTP from email"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <div className="relative">
            <input
              className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 pr-10"
              type={showPassword ? "text" : "password"}
              required
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye className="text-lg" /> : <RiEyeCloseFill className="text-lg" />}
            </button>
          </div>

          <input
            className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}

          <button
            type="submit"
            disabled={!isFormValid}
            className="bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-semibold rounded-lg py-2 text-sm transition shadow-sm mt-2"
          >
            Reset Password
          </button>
        </form>
      </div>

      <footer className="mt-8 text-xs text-gray-400">
        © 2026 Instagram from Meta
      </footer>
    </div>
  );
}

export default ResetPasswordPage;
