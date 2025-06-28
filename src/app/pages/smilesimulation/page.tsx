"use client";
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import Button from "../../components/button"

const smilesimulation = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [smileProgress, setSmileProgress] = useState(0);
  const smileDuration = 4; // detik
  const intervalTime = 100; // ms
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // untuk membersihkan interval nanti
  const [finalText, setFinalText] = useState<string>("")
  const motivations = [
    "Smile can boost your mood and reduce stress 😊",
    "Smile can light up someone's day ✨",
    "Smile releases endorphins - feel the joy! 😄",
    "A smile is contagious - spread happiness! 🌟",
    "Keep smiling, it's good for your health! 💖",
  ];



  // Load model dan aktifkan kamera
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
    };

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam", err);
      }
    };

    loadModels().then(startVideo);
  }, []);

  const handleVideoReady = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const displaySize = {
      width: video.videoWidth,
      height: video.videoHeight,
    };
    faceapi.matchDimensions(canvas, displaySize);

    intervalRef.current = setInterval(async () => {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      const resized = detection ? faceapi.resizeResults(detection, displaySize) : null;

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (resized) {
        faceapi.draw.drawDetections(canvas, resized);     // ✅ Gambar bounding box
        faceapi.draw.drawFaceLandmarks(canvas, resized);  // ✅ Gambar titik-titik wajah

        // ✅ Tambahkan label ekspresi
        if (ctx) {
          const { x, y } = resized.detection.box;
          const expressions = resized.expressions;
          const maxExp = Object.entries(expressions).reduce((prev, curr) =>
            curr[1] > prev[1] ? curr : prev
          )[0];

          ctx.font = "16px Arial";
          ctx.fillStyle = "red";
          ctx.fillText(`Expression: ${maxExp}`, x, y - 10);
        }

        // ✅ Update progress kalau senyum
        const happyScore = resized.expressions.happy;
        if (happyScore > 0.5) {
          setSmileProgress((prev) =>
            Math.min(prev + (100 / (smileDuration * 1000 / intervalTime)), 100)
          );
        }
      }
    }, intervalTime);
  };

  // Clear interval saat unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (smileProgress >= 100) {
      let randomIdx = Math.floor(Math.random() * motivations.length)
      setFinalText(finalText => (motivations[randomIdx]))
      // if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [smileProgress])

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-white p-6 relative flex flex-col items-center">
      <Button />
      {finalText && (
        <p className="text-xl md:text-2xl text-yellow-700 font-bold text-center mt-6 animate-pulse">{finalText}</p>
      )}
      <div
        style={{
          position: "relative",
          width: "640px",
          height: "480px",
        }}
      >
        <video
          className="mt-20"
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width={640}
          height={480}
          onLoadedMetadata={handleVideoReady}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            borderRadius: 12,
            border: "4px solid #facc15", // 💡 border kuning (Tailwind yellow-400)
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)", // opsional: biar lebih keren
          }}
        />
        <canvas
          className="mt-20"
          ref={canvasRef}
          width={640}
          height={480}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            borderRadius: 12, // opsional agar sudut canvas cocok dengan video
          }}
        />
      </div>




      {/* Progress Bar */}
      <div className="w-full max-w-md mt-6 bg-gray-200 rounded-full h-6 z-100 mt-24">
        <div
          className="bg-green-500 h-6 rounded-full transition-all duration-200"
          style={{ width: `${smileProgress}%` }}
        ></div>
      </div>
      <p className="mt-2 text-lg font-semibold z-100 text-yellow-700">{Math.round(smileProgress)}%</p>
    </div>
  );
};

export default smilesimulation;
