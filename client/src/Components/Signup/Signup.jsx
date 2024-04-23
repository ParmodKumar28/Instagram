// Imports
import styles from "./Signup.module.css";
import { FaEye, FaFacebookSquare } from "react-icons/fa";
import iphone from "../../assets/Iphone.png";
// import iphone2 from "../../assets/Iphone2.png";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signUpAsync, usersSelector } from "../../Redux/Reducer/usersReducer";
import { ClipLoader } from "react-spinners";
import { RiEyeCloseFill } from "react-icons/ri";
import Cookies from "js-cookie";

// Signup login component is here
export default function SignUp() {
    // States
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // States from the user's reducer here
    const { signUpLoading } = useSelector(usersSelector);

    // Dispatcher
    const dispatch = useDispatch();

    // Navigator
    const navigate = useNavigate();

    // Handler's
    const handleSignUp = (e) => {
        try {
            // Preventing default behaviour of submit here
            e.preventDefault();
            // Dispatching action to the user reducer
            dispatch(signUpAsync({ email, fullName, username, password }))

            // Clear field's
            setEmail("");
            setFullName("");
            setUsername("");
            setPassword("");

            // Redirect to home page after successful login
            if (Cookies.get("isSignIn")) {
                navigate("/");
            }

        } catch (error) {
            console.error("SignUp failed:", error);
        }

    };

    // Returning JSX
    return (
        <>
            {/* Main */}
            <main
                className="flex justify-center items-center"
                id={styles.mainContainer}
            >
                {/* Iphone Instagram image visible starts sm width */}
                <div
                    className="hidden md:inline-block mx-20 mb-28 slide-right"
                    id={styles.ImageContainer}
                >
                    <img
                        className="max-w-2xl drop-shadow-2xl"
                        src={iphone}
                        // src="https://www.pngitem.com/pimgs/m/299-2998371_iphone-instagram-png-transparent-png.png"
                        alt="Image"
                    />
                </div>
                {/* Iphone instagram image end's */}

                {/* Form container */}
                <div>
                    <div className="w-[22rem] flex flex-col px-8 py-8 justify-center items-center mx-auto mt-10 sm:border rounded-lg shadow-lg">
                        {/* Branding Here */}
                        <h1
                            className="text-[3.2rem] mb-5 text-gray-800"
                            style={{ fontFamily: "Lobster Two" }}
                        >
                            Instagram
                        </h1>
                        {/* Branding End's Here */}

                        {/* Details */}
                        <p className="text-center mb-2 font-medium text-gray-500">
                            Sign up to see photos and videos from your friends.
                        </p>
                        {/* Details end's */}

                        {/* Login with facebook */}
                        <div className="flex items-center gap-2 bg-sky-500 text-white p-2 rounded-md w-full justify-center select-none">
                            <FaFacebookSquare className="text-2xl" />
                            <p className="font-medium">Log in With Facebook</p>
                        </div>
                        {/* Login with facebook end's */}

                        {/* OR */}
                        <div className="my-4 flex items-center gap-2 w-full">
                            <span className="w-1/2 border-t-2"></span>
                            <p className="font-medium text-gray-500 mx-2">OR</p>
                            <span className="w-1/2 border-t-2"></span>
                        </div>
                        {/* OR Ends */}

                        {/* Form */}
                        <form className="flex flex-col items-center">
                            {/* Email Input */}
                            <input
                                className="my-1 px-3 py-1 h-10 border-2 w-full text-sm focus:outline-slate-600 rounded"
                                type="email"
                                name="email"
                                required
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {/* Full Name Input */}
                            <input
                                className="my-1 px-3 py-1 h-10 border-2 w-full text-sm focus:outline-slate-600 rounded"
                                type="text"
                                name="name"
                                required
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                            {/* Username Input */}
                            <input
                                className="my-1 px-3 py-1 h-10 border-2 w-full text-sm focus:outline-slate-600 rounded"
                                type="text"
                                name="username"
                                required
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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

                            {/* Privacy Policy */}
                            <p className="text-xs text-gray-500 text-center my-2 select-none">
                                People who use our service may have uploaded your contact
                                information to Instagram.{" "}
                                <span className="text-blue-900 cursor-pointer">Learn more</span>
                            </p>
                            <p className="text-xs text-gray-500 text-center my-2">
                                By signing up, you agree to our{" "}
                                <a className="text-blue-900 cursor-pointer">
                                    Terms, Privacy Policy
                                </a>{" "}
                                and{" "}
                                <a className="text-blue-900 cursor-pointer">Cookies Policy.</a>
                            </p>
                            {/* Privacy Policy End's*/}

                            {/* Signup Button */}
                            <button
                                className="bg-sky-400 w-full text-white rounded-lg my-2 p-1 font-medium  hover:bg-sky-600 transition-all"
                                type="submit"
                                onClick={(e) => handleSignUp(e)}
                            >
                                {signUpLoading ? (
                                    <ClipLoader color={"#ffffff"} loading={true} size={20} />
                                ) : (
                                    "Sign Up"
                                )}
                            </button>
                            {/* Signup Button End's */}

                        </form>
                        {/* Form ends */}
                    </div>

                    {/* Have an account */}
                    <div className="text-center w-[22rem] sm:border mx-auto my-5 py-4 rounded-lg shadow-lg">
                        <p className="text-base">
                            Have an account?{" "}
                            <Link
                                to={"/login"}
                                className="text-sky-500 font-medium cursor-pointer hover:text-sky-600 transition-all"
                            >
                                {" "}
                                Log in
                            </Link>
                        </p>
                    </div>
                    {/* Have an account ends */}

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
                </div>
                {/* Form container */}
            </main>
            {/* Main conatiner end's */}

            {/* Footer */}
            <footer className="py-10 flex flex-col gap-2 items-center text-sm text-gray-500 w-auto">
                {/* Links */}
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
                    <span className="cursor-pointer hover:underline">
                        Contact uploading and non-users
                    </span>
                    <span className="cursor-pointer hover:underline">Meta Verified</span>
                </div>
                {/* Language and copyright */}
                <div className="flex gap-4 flex-wrap justify-center">
                    <span>English (UK)</span>
                    <span>© 2024 Instagram from Meta</span>
                </div>
                {/* Language and copyright end's */}
            </footer>
            {/* Footer ends */}
        </>
    );
}
