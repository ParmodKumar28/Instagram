export function InstagramLogo({ className = "", size = "text-4xl" }) {
  return (
    <span
      className={`bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-purple-600 to-gray-800 font-bold select-none inline-block tracking-normal px-2 pt-1 pb-3 leading-normal ${size} ${className}`}
      style={{ fontFamily: "'Lobster Two', 'Grand Hotel', cursive" }}
    >
      Instagram
    </span>
  );
}

export default InstagramLogo;
