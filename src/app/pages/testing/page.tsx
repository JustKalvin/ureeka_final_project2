// app/video-drive/page.tsx
"use client";
import React from "react";
import Footer from "../../components/Footer"

const GoogleDriveVideo = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Video dari Google Drive</h1>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title="Rickroll 🙂"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <Footer />
    </div>
  );
};

export default GoogleDriveVideo;
