// Imports
import { useState } from "react";
import { CiLock } from "react-icons/ci";
import { IoArrowBack } from "react-icons/io5";
import { Link } from "react-router-dom";

// Component for the forgot password
export default function ForgotPassword() {
    // States
    const [email, setEmail] = useState("");

    // Handler's
    const sendEmailHandler = (e) => {
        // Preventing default behaviour of submit here
        e.preventDefault();

        // Clear field's
        setEmail("");
    }

    // Returning JSX
    return (
        // Main container
        <div id="forgotPasswordContainer">
            {/* Nav */}
            <nav className="flex border-b h-16 items-center">
                <p
                    className="text-black text-xl ms-60 font-bold"
                    style={{ fontFamily: "Lobster Two" }}
                >
                    Instagram
                </p>
            </nav>
            {/* Nav Ends */}

            {/* Form container */}
            <div
                className="mx-auto my-5 w-96 sm:border sm:border-gray-300 flex flex-col items-center rounded-lg shadow-lg"
                id="formContainer"
            >
                {/* Lock icon */}
                <div className="border-2 border-gray-700 rounded-[50%] p-2 mt-5">
                    <CiLock className="text-7xl text-center" />
                </div>
                {/*  */}

                <p className="font-medium my-2 w-80 text-center">
                    Trouble with logging in?
                </p>
                <p className=" text-center text-gray-500 w-80">
                    Enter your email address we&apos;ll send you a link to get back into
                    your account.
                </p>
                {/* Form starts */}
                <form className="my-2 flex flex-col items-center w-80">
                    <input
                        className="border py-1 px-2 w-full my-2 focus:outline-slate-400 bg-slate-50 rounded h-10"
                        type="text"
                        name="email"
                        required={true}
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {/* Send email Button */}
                    <button
                        className={`my-2 ${!email ? "bg-sky-200" : "bg-sky-500"
                            } text-white rounded-md py-1 px-2 w-full transition-all`}
                        type="submit"
                        disabled={!email ? true : false}
                        onClick={(e) => sendEmailHandler(e)}
                    >
                        Send Login Link
                    </button>
                    {/* Send email Button end's */}

                    <p className="text-sm text-blue-800 mb-4">
                        Can&apos;t reset your password ?
                    </p>
                </form>
                {/* Form ends */}

                {/* OR */}
                <div className="my-4 flex items-center gap-2 w-full">
                    <span className="w-1/2 border-t-2 ms-4"></span>
                    <p className="font-medium text-gray-500 mx-2">OR</p>
                    <span className="w-1/2 border-t-2 me-4"></span>
                </div>
                {/* OR Ends */}

                {/* Link to the sign-up page */}
                <Link to={"/sign-up"} className="text-gray-800 font-medium mb-2 hover:text-gray-600 cursor-pointer">
                    Create New Account
                </Link>
                {/* Link to the sign-up page end's */}

                {/* Back to login */}
                <div className="border-2 w-full mt-20 h-12 flex justify-center items-center active:scale-95 transition-all select-none">
                    <IoArrowBack className="text-2xl me-2 text-gray-800 font-medium" />
                    {/* Link to login page */}
                    <Link to={"/login"}>
                        <button className="text-gray-800 font-medium hover:text-gray-500 transition-all" type="button">
                            {" "}
                            Back to Login
                        </button>
                    </Link>

                </div>
                {/* Back to login end's */}
            </div>
        </div>
    );
}
