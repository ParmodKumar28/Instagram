import { getDefaultAvatar } from "../../constants";

export const Avatar = ({
  src,
  alt = "Profile",
  className = "object-cover w-10 h-10 border border-gray-200 rounded-full",
  gender,
  username,
  onClick,
}) => {
  const fallbackSrc = getDefaultAvatar(gender, username);
  const initialSrc = src || fallbackSrc;

  return (
    <img
      src={initialSrc}
      alt={alt}
      className={className}
      onClick={onClick}
      loading="lazy"
      onError={(e) => {
        if (e.currentTarget.src !== fallbackSrc) {
          e.currentTarget.onerror = null;
          e.currentTarget.src = fallbackSrc;
        }
      }}
    />
  );
};

export default Avatar;
