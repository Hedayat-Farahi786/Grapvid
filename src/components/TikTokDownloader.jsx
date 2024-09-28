import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

const TikTokDownloader = () => {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState(null); // Store the video info
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVideoInfo(null);

    try {
      const response = await axios.post("http://localhost:5001/api/tiktok-video-info", { url });
      setVideoInfo(response.data);
      toast.success("TikTok video information fetched successfully!");
    } catch (err) {
      console.error("Error fetching TikTok video info:", err);
      toast.error("Failed to fetch video info. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!videoInfo || !videoInfo.video_url) {
      toast.error("No video URL found.");
      return;
    }

    // Trigger download in the browser
    const link = document.createElement("a");
    link.href = videoInfo.video_url;
    link.setAttribute("download", `${videoInfo.title}.mp4`); // Set the file name for the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Download started in the browser!");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          TikTok Video Downloader
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input
            type="url"
            required
            placeholder="TikTok Video URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="w-full p-2 text-white bg-blue-500 rounded-md"
            disabled={loading}
          >
            {loading ? "Fetching Video Info..." : "Get Video Info"}
          </button>
        </form>

        {videoInfo && (
          <div className="mt-4">
            <img src={videoInfo.thumbnailUrl} alt="Thumbnail" className="w-full rounded-md" />
            <h3 className="mt-2 text-lg font-semibold">{videoInfo.title}</h3>
            <button
              type="button"
              className="mt-4 w-full p-2 text-white bg-green-500 rounded-md"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? "Downloading..." : "Download Video"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TikTokDownloader;
