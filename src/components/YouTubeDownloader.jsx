import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

const YouTubeDownloader = () => {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [selectedVideoItag, setSelectedVideoItag] = useState("");
  const [selectedAudioItag, setSelectedAudioItag] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVideoInfo(null);
    setSelectedVideoItag("");
    setSelectedAudioItag("");

    try {
      const response = await axios.post("https://grapvid-backend.onrender.com/api/video-info", { url });
      setVideoInfo(response.data);
      toast.success("Video information fetched successfully!");
    } catch (err) {
      console.error("Error fetching video info:", err);
      toast.error("Failed to fetch video info. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedVideoItag || !selectedAudioItag) {
      toast.error("Please select both a video and an audio format.");
      return;
    }

    const apiUrl = `https://grapvid-backend.onrender.com/api/download?url=${encodeURIComponent(url)}&videoItag=${selectedVideoItag}&audioItag=${selectedAudioItag}`;

    setDownloading(true);

    try {
      const response = await axios.get(apiUrl);
      const { video_url, video_title } = response.data;

      // Create a temporary anchor element to trigger the download
      const link = document.createElement("a");
      link.href = video_url;
      link.setAttribute("download", video_title);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // Remove the link after triggering the download
      document.body.removeChild(link);

      toast.success("Download started in the browser!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download the video. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          YouTube Video Info
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input
            type="url"
            required
            placeholder="YouTube Video URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="w-full p-2 text-white bg-blue-500 rounded-md"
            disabled={loading}
          >
            {loading ? "Loading..." : "Get Video Info"}
          </button>
        </form>

        {videoInfo && (
          <div className="mt-4">
            <img src={videoInfo.thumbnailUrl} alt="Thumbnail" className="w-full rounded-md" />
            <h3 className="mt-2 text-lg font-semibold">{videoInfo.title}</h3>

            <div className="mt-4">
              <h4 className="font-semibold">Select Video Format:</h4>
              <select
                className="block w-full p-2 border border-gray-300 rounded-md"
                value={selectedVideoItag}
                onChange={(e) => setSelectedVideoItag(e.target.value)}
              >
                {videoInfo.formats
                  .filter(format => format.has_video)
                  .map(format => (
                    <option key={format.itag} value={format.itag}>
                      {`${format.quality} (${format.filesize || "Unknown size"})`}
                    </option>
                  ))}
              </select>

              <h4 className="font-semibold mt-4">Select Audio Format:</h4>
              <select
                className="block w-full p-2 border border-gray-300 rounded-md"
                value={selectedAudioItag}
                onChange={(e) => setSelectedAudioItag(e.target.value)}
              >
                {videoInfo.formats
                  .filter(format => format.has_audio && !format.has_video)
                  .map(format => (
                    <option key={format.itag} value={format.itag}>
                      {`${format.quality} (${format.filesize || "Unknown size"})`}
                    </option>
                  ))}
              </select>

              <button
                type="button"
                className="mt-4 w-full p-2 text-white bg-green-500 rounded-md"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? "Downloading..." : "Download Video"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeDownloader;
