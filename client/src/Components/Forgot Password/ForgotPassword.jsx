// Imports
import { CiLock } from "react-icons/ci";

// Component for the forgot password
export default function ForgotPassword() {
    // Returning JSX
    return (
        // Main container
        <div id="forgotPasswordContainer">
            {/* Nav */}
            <nav className='flex border-b h-16 items-center'>
                <p className='text-black text-xl ms-60 font-bold' style={{ fontFamily: "Oleo Script" }}>Instagram</p>
            </nav>
            {/* Nav Ends */}

            {/* Form container */}
            <div className='mx-auto my-5 w-96 sm:border sm:border-gray-300 rounded flex flex-col items-center' id="formContainer">
                {/* Lock icon */}
                <div className="border-2 border-gray-700 rounded-[50%] p-2 mt-5">
                    <CiLock className="text-7xl text-center" />
                </div>

                {/*  */}
                <p className='font-medium my-2 w-80 text-center'>Trouble with logging in?</p>
                <p className=" text-center text-gray-500 w-80">Enter your email address we&apos;ll send you a link to get back into your account.</p>
                <form className='my-2 flex flex-col items-center w-80'>
                    <input className='border py-1 px-2 w-full my-2 focus:outline-slate-400 bg-slate-50 rounded h-10' type="text" name='email' required={true} placeholder='Email address' />
                    <button className='my-2 bg-sky-500 text-white rounded-md py-1 px-2 w-full' type='button'>Send Login Link</button>
                    <p className='text-sm text-blue-800 mb-4'>Can&apos;t reset your password ?</p>
                </form>
                {/* OR */}
                <div className="my-4 flex items-center gap-2 w-full">
                    <span className="w-1/2 border-t-2"></span>
                    <p className="font-medium text-gray-500 mx-2">OR</p>
                    <span className="w-1/2 border-t-2"></span>
                </div>
                {/* OR Ends */}
                <p className='text-gray-800 font-medium mb-2 hover:text-gray-600 cursor-pointer'>Create New Account</p>
                <button className='text-gray-800 font-medium border-2 w-full mt-20 h-12' type='button'>Back to Login</button>
            </div>
        </div>
    )
}