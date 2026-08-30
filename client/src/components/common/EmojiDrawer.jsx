import { useEffect, useRef } from "react";
import EmojiPicker, {
  Theme,
  EmojiStyle,
  SuggestionMode,
} from "emoji-picker-react";

export function EmojiDrawer({
  isOpen,
  onClose,
  onEmojiSelect,
  position = "top", // "top" | "bottom" | "top-right" | "top-left" | "bottom-right" | "bottom-left"
  width = 320,
  height = 380,
  className = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClasses = {
    top: "bottom-full mb-2 left-0",
    "top-right": "bottom-full mb-2 right-0",
    "top-left": "bottom-full mb-2 left-0",
    bottom: "top-full mt-2 left-0",
    "bottom-right": "top-full mt-2 right-0",
    "bottom-left": "top-full mt-2 left-0",
  };

  const currentPositionClass = positionClasses[position] || positionClasses.top;

  return (
    <div
      ref={containerRef}
      className={`absolute z-[100] shadow-2xl rounded-2xl overflow-hidden border border-gray-200 bg-white ${currentPositionClass} ${className}`}
      style={{ width, height }}
      onClick={(e) => e.stopPropagation()}
    >
      <EmojiPicker
        onEmojiClick={(emojiData) => {
          if (emojiData?.emoji) {
            onEmojiSelect(emojiData.emoji);
          }
        }}
        autoFocusSearch={false}
        theme={Theme.LIGHT}
        emojiStyle={EmojiStyle.APPLE}
        skinTonesDisabled={true}
        suggestedFailedMode={SuggestionMode.HIDE}
        lazyLoadEmojis={true}
        searchPlaceHolder="Search emoji..."
        width="100%"
        height="100%"
        previewConfig={{
          showPreview: false,
        }}
      />
    </div>
  );
}

export default EmojiDrawer;
