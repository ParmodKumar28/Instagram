import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16 select-none">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight mb-4">
        Sorry, this page isn&apos;t available.
      </h1>
      <p className="text-sm md:text-base text-gray-600 max-w-md mb-6 leading-relaxed">
        The link you followed may be broken, or the page may have been removed.{" "}
        <Link
          to="/"
          className="text-[#0095F6] hover:text-[#00376B] font-semibold transition inline-block ml-1"
        >
          Go back to Instagram.
        </Link>
      </p>
    </div>
  );
}

export default NotFoundPage;
