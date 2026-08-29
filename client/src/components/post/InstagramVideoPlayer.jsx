import { useState, useRef, useEffect } from "react";
import { IoVolumeMute, IoVolumeHigh, IoPlay, IoPause } from "react-icons/io5";

export function InstagramVideoPlayer({
  src,
  onDoubleTap,
  className = "w-full object-contain max-h-[620px] bg-black",
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showPlayStateBadge, setShowPlayStateBadge] = useState(false);
  const [clickTimeout, setClickTimeout] = useState(null);

  // Autoplay on view entry, pause when out of view
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
    setShowPlayStateBadge(true);
    setTimeout(() => setShowPlayStateBadge(false), 700);
  };

  const handleVideoClick = () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      if (onDoubleTap) onDoubleTap();
    } else {
      const timeout = setTimeout(() => {
        togglePlay();
        setClickTimeout(null);
      }, 250);
      setClickTimeout(timeout);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center bg-black cursor-pointer select-none overflow-hidden"
      onClick={handleVideoClick}
    >
      <video
        ref={videoRef}
        src={src}
        className={className}
        loop
        playsInline
        muted={isMuted}
        autoPlay
        preload="metadata"
      />

      {/* Centered Instagram Play / Pause Pop Badge */}
      {showPlayStateBadge && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-in fade-in zoom-in-75 duration-200">
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white">
            {isPlaying ? (
              <IoPlay className="text-3xl ml-1" />
            ) : (
              <IoPause className="text-3xl" />
            )}
          </div>
        </div>
      )}

      {/* Bottom Right Instagram Mute Button */}
      <button
        onClick={toggleMute}
        className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/65 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center z-20 transition focus:outline-none shadow-md"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? (
          <IoVolumeMute className="text-base" />
        ) : (
          <IoVolumeHigh className="text-base" />
        )}
      </button>
    </div>
  );
}

export default InstagramVideoPlayer;
