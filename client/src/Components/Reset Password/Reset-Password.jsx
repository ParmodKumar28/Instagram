// Imports
import { useState } from "react";
import { FaEye } from "react-icons/fa";
import { RiEyeCloseFill } from "react-icons/ri";
import { Link } from "react-router-dom";

// Component for the reset password here
function ResetPassword() {
    // States
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Handler's
    const resetPasswordHandler = (e) => {
        // Preventing default behaviour of submit here
        e.preventDefault();

        // Clear field's
        setNewPassword("");
        setConfirmPassword("");
    }

    // Returning JSX
    return (
        // Main container
        <div id="resetPasswordContainer">
            {/* Nav */}
            <nav className="flex border-b h-16 items-center justify-around sm:px-20">
                <Link to={"/sign-up"}
                    className="text-black text-2xl font-bold"
                    style={{ fontFamily: "Lobster Two" }}
                >
                    Instagram
                </Link>

                {/* Button Container */}
                <div className="flex gap-4">
                    {/* Login button */}
                    <Link to={"/sign-up"}>
                        <button className="bg-sky-500 font-medium hover:bg-sky-400 px-2 py-1 rounded-md w-20 text-white text-base">
                            Log in
                        </button>
                    </Link>
                    {/* Login button end's */}

                    {/* Sign up button */}
                    <button className="text-sky-600 font-medium text-base hover:text-sky-400">
                        <Link to={"/sign-up"}>
                            Sign up
                        </Link>
                    </button>
                    {/* Sign up button's */}
                </div>
                {/* Button Container End's */}
            </nav>
            {/* Nav Ends */}

            {/* Form container */}
            <div
                className="mx-auto my-5 p-16 w-[22rem] sm:w-96 sm:border sm:border-gray-300 flex flex-col items-center rounded-lg shadow-lg"
                id="formContainer"
            >

                {/* Password requirement's */}
                <p className="font-bold my-2 w-72 text-center">
                    Create a strong password
                </p>
                <p className=" text-center text-gray-500 w-72">
                    Your password must be at least six characters and should include a combination of numbers, letters and special characters (!$@％).
                </p>
                {/* Password requirement's end's */}

                {/* Form starts */}
                <form className="my-2 flex flex-col items-center w-72">
                    {/* New Password */}
                    <div className="w-full" style={{ position: 'relative' }}>
                        {/* Input */}
                        <input
                            className="my-1 px-3 py-1 h-10 border-2 w-full text-sm focus:outline-slate-600 rounded"
                            type={showPassword ? "text" : "password"}
                            name="newPassword"
                            required={true}
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
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

                    {/* Confirm Password */}
                    <div className="w-full" style={{ position: 'relative' }}>
                        {/* Input */}
                        <input
                            className="border py-1 px-2 w-full my-4 focus:outline-slate-400 bg-slate-50 rounded h-12"
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            required={true}
                            placeholder="New Password Again"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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

                    {/* Rest Password Button */}
                    <button
                        className={`my-4 ${(!newPassword || !confirmPassword) || (newPassword !== confirmPassword) ? "bg-sky-200" : "bg-sky-500"
                            } text-white rounded-md py-1 px-2 w-full transition-all h-12`}
                        type="submit"
                        disabled={(!newPassword || !confirmPassword) || (newPassword !== confirmPassword) ? true : false}
                        onClick={(e) => resetPasswordHandler(e)}
                    >
                        Reset Password
                    </button>
                    {/* Rest Password Button end's */}
                </form>
                {/* Form ends */}
            </div>
        </div>
    );
}

// Default Export
export default ResetPassword