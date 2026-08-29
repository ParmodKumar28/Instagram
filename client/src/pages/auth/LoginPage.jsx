import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginAsync, usersSelector } from "../../redux/slices/usersSlice";
import { ClipLoader } from "react-spinners";
import { RiEyeCloseFill } from "react-icons/ri";
import { FaEye } from "react-icons/fa";
import InstagramLogo from "../../components/common/InstagramLogo";
import playstoreBadge from "../../assets/playstore.svg";
import microsoftBadge from "../../assets/microsoft.svg";
import facebookIcon from "../../assets/facebook.svg";

export function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { loginLoading } = useSelector(usersSelector);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(
        loginAsync({ identifier, password })
      ).unwrap();
      if (result) {
        setIdentifier("");
        setPassword("");
        navigate("/");
      }
    } catch {
      // Error handled in thunk with toast
    }
  };

  return (
    <>
      <div className="w-5/6 md:w-[22rem] flex flex-col px-8 py-6 justify-center items-center mx-auto mt-10 sm:border rounded-lg shadow-lg select-none bg-white">
        {/* Original Logo Instagram */}
        <InstagramLogo />

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col items-center w-full">
          {/* Input Email/Username/Phone */}
          <input
            className="my-1 px-3 py-1 h-10 border-2 w-full text-sm focus:outline-slate-600 rounded"
            type="text"
            name="identifier"
            required
            placeholder="Username, Email, or Mobile Number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          {/* Password Input */}
          <div className="w-full relative">
            <input
              className="my-1 px-3 py-1 h-10 border-2 w-full text-sm focus:outline-slate-600 rounded pr-10"
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <RiEyeCloseFill className="text-xl" /> : <FaEye className="text-xl" />}
            </span>
          </div>

          {/* Login Button */}
          <button
            className="bg-sky-400 w-full text-white rounded-lg my-2 p-2 font-medium hover:bg-sky-600 select-none transition flex justify-center items-center"
            type="submit"
            disabled={loginLoading}
          >
            {loginLoading ? (
              <ClipLoader color={"#ffffff"} loading={true} size={20} />
            ) : (
              "Login"
            )}
          </button>

          {/* OR */}
          <div className="my-4 flex items-center gap-2 w-full">
            <span className="w-1/2 border-t-2"></span>
            <p className="font-medium text-gray-500 mx-2">OR</p>
            <span className="w-1/2 border-t-2"></span>
          </div>

          {/* Login with facebook */}
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
            <img
              className="h-5 w-5"
              src={facebookIcon}
              alt="Facebook"
            />
            <p className="text-[#385185] font-medium text-sm">Log in With Facebook</p>
          </div>

          {/* Link To Forgot password */}
          <Link to="/forgot-password" className="text-[#385185] text-sm my-4 hover:underline">
            Forgotten your password?
          </Link>
        </form>
      </div>

      {/* Don't have an account */}
      <div className="w-5/6 text-center md:w-[22rem] mx-auto my-5 py-4 sm:border rounded-lg shadow-lg bg-white">
        <p className="text-base">
          Don&apos;t have an account?{" "}
          <Link to="/sign-up" className="text-sky-500 font-medium cursor-pointer select-none hover:underline">
            Sign Up
          </Link>
        </p>
      </div>

      {/* Download App */}
      <div className="mx-auto my-2 w-[22rem] flex flex-col items-center gap-5">
        <p className="text-center text-sm text-gray-600">Get The App</p>
        <div className="flex w-full gap-2 justify-center">
          <a
            href="https://play.google.com/store/apps/details?id=com.instagram.android"
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-80 transition"
          >
            <img
              className="h-10 object-contain"
              src={playstoreBadge}
              alt="Get it on Google Play"
            />
          </a>
          <a
            href="https://apps.microsoft.com/detail/9nblggh5l9xt"
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-80 transition"
          >
            <img
              className="h-10 object-contain"
              src={microsoftBadge}
              alt="Get it from Microsoft"
            />
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 flex flex-col gap-2 items-center text-sm text-gray-500 w-auto">
        <div className="flex gap-4 flex-wrap justify-center px-4">
          <span className="cursor-pointer hover:underline">Meta</span>
          <span className="cursor-pointer hover:underline">About</span>
          <span className="cursor-pointer hover:underline">Blog</span>
          <span className="cursor-pointer hover:underline">Jobs</span>
          <span className="cursor-pointer hover:underline">Help</span>
          <span className="cursor-pointer hover:underline">API</span>
          <span className="cursor-pointer hover:underline">Privacy</span>
          <span className="cursor-pointer hover:underline">Terms</span>
          <span className="cursor-pointer hover:underline">Locations</span>
          <span className="cursor-pointer hover:underline">Instagram Lite</span>
          <span className="cursor-pointer hover:underline">Threads</span>
          <span className="cursor-pointer hover:underline">Contact uploading and non-users</span>
          <span className="cursor-pointer hover:underline">Meta Verified</span>
        </div>
        <div className="flex gap-4 flex-wrap justify-center">
          <span>English (UK)</span>
          <span>© 2026 Instagram from Meta</span>
        </div>
      </footer>
    </>
  );
}

export default LoginPage;
