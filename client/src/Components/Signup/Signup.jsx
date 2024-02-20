// Imports
import styles from "./Signup.module.css";

// Signup login component is here
export default function SignUp() {
    // Returning JSX
    return (
        <>
            {/* Main */}
            <main className="flex justify-center" id={styles.mainContainer}>
                {/* Iphone Instagram image visible starts sm width */}
                <div className="hidden md:inline-block" id={styles.ImageContainer}>
                    <img
                        className=""
                        src="https://www.pngitem.com/pimgs/m/299-2998371_iphone-instagram-png-transparent-png.png"
                        alt="Image"
                    />
                </div>
                {/* Iphone instagram image eds */}

                {/* Form container */}
                <div>
                    <div className="w-[22rem] flex flex-col px-8 py-8 justify-center items-center mx-auto mt-10 sm:border-2">
                        <h1 className="text-[3.2rem] mb-5">Instagram</h1>
                        <p className="text-center mb-2 font-medium text-gray-500">
                            Sign up to see photos and videos from your friends.
                        </p>
                        <button
                            className="bg-sky-500 text-white font-medium rounded-lg mt-2 py-1.5 w-full hover:bg-blue-600"
                            type="button"
                        >
                            Log in with Facebook
                        </button>
                        <p className="my-2 text-[1rem] font-medium text-gray-500">OR</p>
                        {/* Form */}
                        <form className="flex flex-col items-center">
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
                                name="name"
                                required
                                placeholder="Full Name"
                            />
                            <input
                                className="my-1 px-3 py-1 h-10 border-2 w-full text-sm focus:outline-slate-600 rounded"
                                type="text"
                                name="username"
                                required
                                placeholder="Username"
                            />
                            <input
                                className="my-1 px-3 py-1 h-10 border-2 w-full text-sm focus:outline-slate-600 rounded"
                                type="text"
                                name="password"
                                required
                                placeholder="Password"
                            />
                            <p className="text-xs text-gray-500 text-center my-2">
                                People who use our service may have uploaded your contact
                                information to Instagram.{" "}
                                <span className="text-blue-900 cursor-pointer">Learn more</span>
                            </p>
                            <p className="text-xs text-gray-500 text-center my-2">
                                By signing up, you agree to our{" "}
                                <a className="text-blue-900 cursor-pointer">
                                    Terms, Privacy Policy
                                </a>
                                and
                                <a className="text-blue-900 cursor-pointer">Cookies Policy.</a>
                            </p>
                            <button
                                className="bg-sky-400 w-full text-white rounded-lg my-2 p-1 font-medium"
                                type="submit"
                            >
                                Sign Up
                            </button>
                        </form>
                        {/* Form ends */}
                    </div>


                    {/* Have an account */}
                    <div className="text-center w-[22rem] sm:border-2 mx-auto my-5 py-4">
                        <p className="text-base">
                            Have an account?{" "}
                            <a className="text-sky-500 font-medium cursor-pointer"> Log in</a>
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

                </div>
                {/* Form container */}
            </main>

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
