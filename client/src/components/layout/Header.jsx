import { Link } from "react-router-dom";
import { InstagramLogo } from "../common/InstagramLogo";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 z-40 px-4 flex items-center justify-between select-none">
      {/* Instagram Logo */}
      <Link to="/" className="flex items-center">
        <InstagramLogo size="text-2xl" className="pb-0 pt-0" />
      </Link>

      {/* Right Action Icons (Notifications & Direct Messages) */}
      <div className="flex items-center space-x-5 text-black">
        <Link to="#notifications" aria-label="Notifications">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </Link>

        <Link to="#messages" aria-label="Messages">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 3.5L1.5 12.5l7 2.5 1.5 6 3.5-3.5 5 3.5L22 3.5z" />
            <line x1="8.5" y1="15" x2="15.5" y2="9" />
          </svg>
        </Link>
      </div>
    </header>
  );
}

export default Header;
