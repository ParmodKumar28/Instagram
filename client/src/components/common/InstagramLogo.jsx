export function InstagramLogo({ className = "" }) {
  return (
    <h1
      className={`bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-purple-600 to-gray-800 text-[3.2rem] mb-4 select-none font-bold text-center ${className}`}
      style={{ fontFamily: "'Lobster Two', cursive" }}
    >
      Instagram
    </h1>
  );
}

export default InstagramLogo;
