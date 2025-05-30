import { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const MediaDisplay = (props) => {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [currentMedia, setCurrentMedia] = useState("");
  useEffect(() => {
    if (mediaFiles[currentMediaIndex] === currentMedia) setIsLoading(false);
    setCurrentMedia(props.project.mediaFiles[currentMediaIndex]);
  }, [currentMediaIndex]);

  useEffect(() => {
    setMediaFiles(props.project.mediaFiles);
    setCurrentMedia(props.project.mediaFiles[0]);
    setCurrentMediaIndex(0);
    setZoomLevel(1);
    if (currentMedia !== props.project.mediaFiles[0]) setIsLoading(true);
  }, [props.project]);

  const getMediaType = (url) => {
    if (!url) return "unknown";
    const extension = url.split(".").pop().toLowerCase();
    if (["mp4", "webm", "ogg", "mov"].includes(extension)) return "video";
    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) return "image";
    if (extension === "pdf") return "pdf";
    return "unknown";
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error("Error attempting to enable fullscreen:", err));
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.error("Error attempting to exit fullscreen:", err));
    }
  };

  const handleZoom = (direction) => {
    if (direction === "in" && zoomLevel < 3) {
      setZoomLevel((prevZoom) => prevZoom + 0.25);
    } else if (direction === "out" && zoomLevel > 0.5) {
      setZoomLevel((prevZoom) => prevZoom - 0.25);
    }
  };

  const navigateMedia = (direction) => {
    if (mediaFiles.length <= 1) return;
    setIsLoading(true);
    setCurrentMediaIndex((prevIndex) => {
      if (direction === "next") {
        return prevIndex === mediaFiles.length - 1 ? 0 : prevIndex + 1;
      } else {
        return prevIndex === 0 ? mediaFiles.length - 1 : prevIndex - 1;
      }
    });
    setZoomLevel(1);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isFullscreen]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col bg-black-200 relative overflow-hidden">
      {/* Media Container */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        style={{
          transform: `scale(${zoomLevel})`,
          transition: "transform 0.3s ease",
        }}
      >
        {!currentMedia ? (
          <div className="text-white-600 opacity-70">No media available</div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 z-10">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
              </div>
            )}

            {getMediaType(currentMedia) === "image" ? (
              <img
                src={currentMedia}
                alt={`Project image ${currentMediaIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                style={{ visibility: isLoading ? "hidden" : "visible" }}
              />
            ) : getMediaType(currentMedia) === "video" ? (
              <video
                src={currentMedia}
                className="max-h-full max-w-full object-contain"
                autoPlay
                muted
                loop
                playsInline
                onLoadedData={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                style={{ visibility: isLoading ? "hidden" : "visible" }}
              />
            ) : getMediaType(currentMedia) === "pdf" ? (
              <iframe
                src={currentMedia}
                className="w-[90vw] h-[90vh] rounded-lg"
                title="PDF Viewer"
                onError={() => setIsLoading(false)}
                onLoad={() => setIsLoading(false)}
                style={{ visibility: isLoading ? "hidden" : "visible" }}
              />
            ) : (
              <div className="text-white-600 opacity-70">Unsupported media format</div>
            )}
          </>
        )}
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 flex justify-between items-center">
        {/* Left side controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMedia("prev")}
            className="text-white-600 hover:text-white-400 p-1 rounded-full bg-transparent"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-white-600 text-sm px-2">{`${currentMediaIndex + 1}/${mediaFiles.length}`}</div>

          <button
            onClick={() => navigateMedia("next")}
            className="text-white-600 hover:text-white-400 p-1 rounded-full bg-transparent"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom("out")}
            className="text-white-600 hover:text-white-400 p-1 rounded-full bg-transparent"
            aria-label="Zoom out"
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <div className="text-white-600 text-xs px-2">{Math.round(zoomLevel * 100)}%</div>

          <button
            onClick={() => handleZoom("in")}
            className="text-white-600 hover:text-white-400 p-1 rounded-full bg-transparent"
            aria-label="Zoom in"
            disabled={zoomLevel >= 3}
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {!props.isMobile && (
            <button
              onClick={toggleFullscreen}
              className="text-white-600 hover:text-white-400 p-1 rounded-full bg-transparent ml-2"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaDisplay;
