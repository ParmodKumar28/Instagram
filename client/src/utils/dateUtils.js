/**
 * Formats a date string or timestamp into a clean Instagram-style relative time string.
 * Examples: 'just now', '45s', '5m', '3h', '2d', '4w'
 */
export function formatTimeAgo(dateString, compact = true) {
  if (!dateString) return "just now";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "just now";

  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) {
    return compact ? `${Math.max(1, seconds)}s` : `${Math.max(1, seconds)} seconds ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return compact ? `${minutes}m` : `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return compact ? `${hours}h` : `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return compact ? `${days}d` : `${days} day${days > 1 ? "s" : ""} ago`;
  }
  const weeks = Math.floor(days / 7);
  if (weeks < 52) {
    return compact ? `${weeks}w` : `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  const years = Math.floor(days / 365);
  return compact ? `${years}y` : `${years} year${years > 1 ? "s" : ""} ago`;
}

/**
 * Formats a date into a readable full date string.
 * Example: 'August 30, 2026'
 */
export function formatFullDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
