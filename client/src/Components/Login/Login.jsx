// Imports
// import styles from "../Login/Login.module.css";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { loginAsync, usersSelector } from "../../Redux/Reducer/usersReducer";
import { ClipLoader } from "react-spinners";
import { RiEyeCloseFill } from "react-icons/ri";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

// Login component is here
export default function Login() {
    // States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // States from the user's reducer here
    const { loginLoading } = useSelector(usersSelector);

    // Navigator
    const navigate = useNavigate();

    // Dispatcher
    const dispatch = useDispatch();

    // Handler's
    // Handler's
    const handleLogin = async (e) => {
        try {
            // Preventing default behaviour of submit here
            e.preventDefault();

            // Dispatching loginAsync thunk here
            await dispatch(loginAsync({ email, password }));

            // Clear fields
            setEmail("");
            setPassword("");

            // Redirect to home page after successful login
            if (Cookies.get("isSignIn")) {
                navigate("/");
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };
    

    // Returning JSX
    return (
        <>
            {/* Form container */}
            <div className="w-[22rem] flex flex-col px-8 py-6 justify-center items-center mx-auto mt-10 sm:border rounded-lg shadow-lg">
                {/* Logo Instgram */}
                <h1 className="text-[3.2rem] mb-5 text-gray-800" style={{ fontFamily: "Lobster Two" }}>Instagram</h1>
                {/* Form */}
                <form className="flex flex-col items-center w-full">
                    {/* Input Email */}
                    <input
                        className="my-1 px-3 py-1 h-10 border-2 w-full text-sm focus:outline-slate-600 rounded"
                        type="email"
                        name="email"
                        required
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {/* Password Input */}
                    <div className="w-full" style={{ position: 'relative' }}>
                        {/* Input */}
                        <input
                            className="my-1 px-3 py-1 h-10 border-2 w-full text-sm focus:outline-slate-600 rounded"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {/* Input ends */}

                        {/* Eye icons  */}
                        <span
                            style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', cursor: 'pointer' }}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEye className="text-xl" /> : <RiEyeCloseFill className="text-xl" />}
                        </span>
                        {/* Eye Icons ends */}
                    </div>

                    {/* Login Button */}
                    <button
                        className="bg-sky-400 w-full text-white rounded-lg my-2 p-1 font-medium hover:bg-sky-600 select-none"
                        type="submit"
                        onClick={(e) => handleLogin(e)}
                    >
                        {loginLoading ? (
                            <ClipLoader color={"#ffffff"} loading={true} size={20} />
                        ) : (
                            "Login"
                        )}
                    </button>
                    {/* Login Button End's */}

                    {/* OR */}
                    <div className="my-4 flex items-center gap-2 w-full">
                        <span className="w-1/2 border-t-2"></span>
                        <p className="font-medium text-gray-500 mx-2">OR</p>
                        <span className="w-1/2 border-t-2"></span>
                    </div>
                    {/* OR Ends */}

                    {/* Login with facebook */}
                    <div className="flex items-center gap-2">
                        <img className="h-5" src="https://cdn-icons-png.flaticon.com/128/733/733547.png" alt="facebook" />
                        <p className="text-[#385185] font-medium">Log in With Facebook</p>
                    </div>
                    {/* Login with facebook end's */}

                    {/* Link To Forgot password */}
                    <Link to={"/forgot-password"} className="text-[#385185] text-sm my-4">Forgotten your password?</Link>
                    {/*  */}

                </form>
                {/* Form ends */}
            </div>


            {/* Don't have an account */}
            <div className="text-center w-[22rem] mx-auto my-5 py-4 sm:border rounded-lg shadow-lg">
                <p className="text-base">
                    Dont&apos;t have an account?
                    {/* Link to sign-up page */}
                    <Link to={"/sign-up"} className="text-sky-500 font-medium cursor-pointer select-none"> Sign Up</Link>
                </p>
            </div>
            {/* Have an account end's */}

            {/* Download App */}
            <div className="mx-auto my-2 w-[22rem] flex flex-col items-center gap-5">
                <p className="text-center text-sm">Get The App</p>
                <div className="flex w-full gap-2 justify-center">
                    <img
                        className="h-12"
                        src="https://static.cdninstagram.com/rsrc.php/v3/yz/r/c5Rp7Ym-Klz.png"
                        alt="Playstore"
                    />
                    <img
                        className="h-12"
                        src="https://static.cdninstagram.com/rsrc.php/v3/yu/r/EHY6QnZYdNX.png"
                        alt="Microsoft Store"
                    />
                </div>
            </div>
            {/* Download App end's */}

            {/* Footer */}
            <footer className="py-10 flex flex-col gap-2 items-center text-sm text-gray-500 w-auto">
                <div className="flex gap-4 flex-wrap justify-center">
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
                    <span>© 2024 Instagram from Meta</span>
                </div>
            </footer>
            {/* Footer ends */}
        </>
    );
}
