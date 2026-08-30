import toast from "react-hot-toast";

/**
 * Truncates text cleanly at word boundaries with an ellipsis.
 */
export function truncateText(text = "", maxLength = 100) {
  if (!text || typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Formats numbers into compact social metrics (e.g. 1200 -> 1.2K, 1500000 -> 1.5M).
 */
export function formatCount(count = 0) {
  const num = Number(count);
  if (isNaN(num) || num <= 0) return "0";
  if (num < 1000) return num.toString();
  if (num < 1000000) {
    return (num / 1000).toFixed(num % 1000 >= 100 ? 1 : 0) + "K";
  }
  return (num / 1000000).toFixed(num % 1000000 >= 100000 ? 1 : 0) + "M";
}

/**
 * Extracts initials from a full name (e.g. 'John Doe' -> 'JD').
 */
export function getInitials(name = "") {
  if (!name || typeof name !== "string") return "U";
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() || "")
    .slice(0, 2)
    .join("");
}

/**
 * Copies a string to clipboard and presents a toast notification.
 */
export async function copyToClipboard(text, successMessage = "Copied to clipboard") {
  try {
    await navigator.clipboard.writeText(text);
    if (successMessage) toast.success(successMessage);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    toast.error("Failed to copy");
    return false;
  }
}
