// app/video-drive/page.tsx
"use client";
import React from "react";

const GoogleDriveVideo = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Video dari Google Drive</h1>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title="Rickroll 🙂"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  );
};

export default GoogleDriveVideo;
