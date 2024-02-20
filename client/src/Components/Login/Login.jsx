// Imports
// import styles from "../Login/Login.module.css";

// Login component is here
export default function Login() {
    // Returning JSX
    return (
        <>
            {/* Form container */}
            <div className="w-[22rem] flex flex-col px-8 py-6 justify-center items-center mx-auto mt-10 sm:border-2">
                <h1 className="text-[3.2rem] mb-5">Instagram</h1>
                {/* Form */}
                <form className="flex flex-col items-center w-full">
                    <input
                        className="my-1 px-3 py-1 h-10 border-2 w-full text-sm focus:outline-slate-600 rounded"
                        type="email"
                        name="email"
                        required
                        placeholder="Email address"
                    />
                    <input
                        className="my-1 px-3 py-1 h-10 border-2 w-full text-sm focus:outline-slate-600 rounded"
                        type="text"
                        name="password"
                        required
                        placeholder="Password"
                    />
                    <button
                        className="bg-sky-400 w-full text-white rounded-lg my-2 p-1 font-medium"
                        type="submit"
                    >
                        Login
                    </button>
                    <p className="my-2 text-[1rem] font-medium text-gray-500">OR</p>

                    <div className="flex items-center gap-2">
                        <img className="h-5" src="https://cdn-icons-png.flaticon.com/128/733/733547.png" alt="facebook" />
                        <p className="text-[#385185] font-medium">Log in With Facebook</p>
                    </div>
                    <p className="text-[#385185] text-sm my-4">Forgotten your password?</p>

                </form>
                {/* Form ends */}
            </div>


            {/* Don't have an account */}
            <div className="text-center w-[22rem] sm:border-2 mx-auto my-5 py-4">
                <p className="text-base">
                    Dont&apos;t have an account?
                    <a className="text-sky-500 font-medium cursor-pointer"> Sign Up</a>
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
            {/* Download App ends */}

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
