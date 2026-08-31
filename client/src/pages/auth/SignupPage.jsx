import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signUpAsync, usersSelector } from "../../redux/slices/usersSlice";
import { ClipLoader } from "react-spinners";
import { RiEyeCloseFill } from "react-icons/ri";
import { FaEye, FaFacebookSquare } from "react-icons/fa";
import InstagramLogo from "../../components/common/InstagramLogo";
import iphone from "../../assets/Iphone.png";
import playstoreBadge from "../../assets/playstore.svg";
import microsoftBadge from "../../assets/microsoft.svg";

export function SignupPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { signUpLoading } = useSelector(usersSelector);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await dispatch(
        signUpAsync({ email, fullName, username, password })
      ).unwrap();
      if (response) {
        setEmail("");
        setFullName("");
        setUsername("");
        setPassword("");
        navigate("/");
      }
    } catch {
      // Error handled in thunk
    }
  };

  return (
    <>
      <main className="flex justify-center items-center select-none min-h-screen py-8">
        {/* iPhone image */}
        <div className="hidden md:inline-block mx-10 lg:mx-20 mb-10 max-w-sm">
          <img
            className="w-full drop-shadow-2xl"
            src={iphone}
            alt="iPhone Preview"
          />
        </div>

        {/* Form container */}
        <div>
          <div className="w-5/6 md:w-[22rem] flex flex-col px-8 py-8 justify-center items-center mx-auto sm:border rounded-lg shadow-lg bg-white">
            {/* Branding Logo */}
            <InstagramLogo />

            <p className="text-center mb-2 font-medium text-gray-500 text-sm">
              Sign up to see photos and videos from your friends.
            </p>

            {/* Login with facebook */}
            <div className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-md w-full justify-center select-none cursor-pointer transition">
              <FaFacebookSquare className="text-2xl" />
              <p className="font-medium text-sm">Log in With Facebook</p>
            </div>

            {/* OR */}
            <div className="my-4 flex items-center gap-2 w-full">
              <span className="w-1/2 border-t-2"></span>
              <p className="font-medium text-gray-500 mx-2">OR</p>
              <span className="w-1/2 border-t-2"></span>
            </div>

            {/* Form */}
            <form onSubmit={handleSignUp} className="flex flex-col items-center w-full">
              <input
                className="my-1 px-3 py-1 h-10 border-2 w-full text-sm focus:outline-slate-600 rounded"
                type="email"
                name="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="my-1 px-3 py-1 h-10 border-2 w-full text-sm focus:outline-slate-600 rounded"
                type="text"
                name="name"
                required
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <input
                className="my-1 px-3 py-1 h-10 border-2 w-full text-sm focus:outline-slate-600 rounded"
                type="text"
                name="username"
                required
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

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

              <p className="text-xs text-gray-500 text-center my-2 select-none">
                People who use our service may have uploaded your contact information to Instagram Clone.{" "}
                <span className="text-blue-900 cursor-pointer hover:underline">Learn more</span>
              </p>

              <p className="text-xs text-gray-500 text-center my-2">
                By signing up, you agree to our{" "}
                <span className="text-blue-900 cursor-pointer hover:underline">Terms, Privacy Policy</span> and{" "}
                <span className="text-blue-900 cursor-pointer hover:underline">Cookies Policy.</span>
              </p>

              <button
                className="bg-sky-400 hover:bg-sky-600 w-full text-white rounded-lg my-2 p-2 font-medium transition flex justify-center items-center"
                type="submit"
                disabled={signUpLoading}
              >
                {signUpLoading ? (
                  <ClipLoader color={"#ffffff"} loading={true} size={20} />
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
          </div>

          {/* Have an account */}
          <div className="w-5/6 text-center md:w-[22rem] mx-auto my-4 py-4 sm:border rounded-lg shadow-lg bg-white">
            <p className="text-base">
              Have an account?{" "}
              <Link to="/login" className="text-sky-500 font-medium cursor-pointer select-none hover:underline">
                Log In
              </Link>
            </p>
          </div>

          {/* Download App */}
          <div className="mx-auto my-2 w-[22rem] flex flex-col items-center gap-4">
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
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 flex flex-col gap-2.5 items-center text-xs text-gray-500 w-auto px-4">
        <div className="flex gap-4 flex-wrap justify-center items-center text-gray-400">
          <span>English (UK)</span>
          <span>© 2026 Instagram Clone by Parmod Kumar</span>
        </div>
        <p className="text-[11px] text-gray-400 text-center max-w-lg mt-1 leading-relaxed">
          Educational Portfolio Project • Not affiliated with, sponsored by, or endorsed by Meta Platforms, Inc. All trademarks belong to their respective owners.
        </p>
      </footer>
    </>
  );
}

export default SignupPage;

