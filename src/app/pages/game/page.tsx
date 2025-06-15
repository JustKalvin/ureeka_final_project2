"use client";
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

const Page = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<string>("Game Started... Don't Laugh!");
  const [retryButton, setRetryButton] = useState<boolean>(false);
  const [memeVideo, setMemeVideo] = useState<any[] | null>([]);
  const [faceStatus, setFaceStatus] = useState<string | null>("Neutral")
  const [randomIdx, setRandomIdx] = useState<number>(-1);
  const [videoToShow, setVideoToShow] = useState<any | null>({})
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    const start = Date.now();
    setStartTime(start);

    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - start) / 1000)); // dalam detik
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);


  useEffect(() => {
    startVideo();
    loadModels();
    fetchMemeVideos();
  }, []);

  useEffect(() => {
    if (randomIdx !== -1 && memeVideo && memeVideo.length > randomIdx) {
      setVideoToShow(memeVideo[randomIdx]);
    }
  }, [randomIdx, memeVideo]);


  const fetchMemeVideos = async () => {
    const response = await axios.post("https://nominally-picked-grubworm.ngrok-free.app/webhook/scraping-meme-videos");
    console.log("hasil fetch : ", response.data)
    const vid = response.data; // Ambil satu video, misalnya yang pertama
    setMemeVideo(vid);
    console.log("Video yang dipilih:", vid);
    setRandomIdx(Math.floor(Math.random() * 9))
  }


  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Camera error:", err));
  };

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    detectFace();
  };

  const detectFace = () => {
    setInterval(async () => {
      if (videoRef.current && canvasRef.current) {
        const detections = await faceapi
          .detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceExpressions();

        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };

        faceapi.matchDimensions(canvasRef.current, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        if (ctx) {
          resizedDetections.forEach((detection) => {
            const { expressions, detection: box } = detection;
            const { x, y } = box.box;

            const filteredExpressions = Object.entries(expressions)
              .filter(([label]) => label === "happy" || label === "neutral")
              .sort((a, b) => b[1] - a[1]);

            filteredExpressions.forEach(([label, confidence], index) => {
              const text = `${label}: ${(confidence * 100).toFixed(1)}%`;
              ctx.fillStyle = "yellow";
              ctx.font = "16px Arial";
              ctx.fillText(text, x, y - 10 - index * 20);
            });
          });
        }

        if (detections.length > 0) {
          const exp = detections[0].expressions;
          const maxExp = Object.entries(exp).reduce((a, b) =>
            a[1] > b[1] ? a : b
          );

          if (maxExp[0] === "happy" && maxExp[1] > 0.8) {
            setStatus("You laughed! You lost 😆.");
            setRetryButton(true);
            setFaceStatus("Happy");

            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
          }
        }
      }
    }, 300);
  };

  const handleRetryButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setStatus("Game Started... Don't Laugh!");
    setRetryButton(false);
    setFaceStatus("Neutral");
    setElapsedTime(0);

    const newStart = Date.now();
    setStartTime(newStart);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - newStart) / 1000));
    }, 1000);

    while (true) {
      let rdm = Math.floor(Math.random() * 9);
      if (randomIdx !== rdm) {
        setRandomIdx(rdm);
        break;
      }
    }
  };


  const convertToEmbedURL = (url: string | undefined) => {
    if (!url || !url.startsWith("http")) return ""; // fallback kalau URL tidak valid

    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");

      // Jika ada videoId, tambahkan autoplay=1 di embed URL
      return videoId
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`
        : url;

    } catch (e) {
      console.error("Invalid video URL:", url, e);
      return "";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };





  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-6 bg-gray-100">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">{status}</h2>

      {retryButton && (
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Wanna Try Again?</h3>
          <button
            onClick={handleRetryButton}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-start mt-6">
        {/* Meme Video */}
        {memeVideo && (
          faceStatus === "Neutral" ? (
            <div className="w-full md:w-[400px]">
              <div className="w-full md:w-[400px]">
                <h1 className={`text-3xl font-bold text-gray-800 opacity-10`}>
                  Time: {formatTime(elapsedTime)}
                </h1>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Watch Meme Video 👇</h3>
                <p>Idx : {randomIdx}</p>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <p className="text-gray-700 font-medium mb-2">{videoToShow?.title}</p>
                  <iframe
                    width="100%"
                    height="215"
                    src={convertToEmbedURL(videoToShow?.url)}
                    title={videoToShow?.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-md"
                  />
                </div>
              </div>
            </div>
          ) : (<p className="text-xl text-red-600 font-bold mt-2">Your score: {elapsedTime}</p>
          )
        )}

        {/* Webcam & Canvas */}
        <div className="relative w-[320px] sm:w-[480px] md:w-[640px] h-[480px] rounded-md overflow-hidden shadow-lg">
          <video
            ref={videoRef}
            autoPlay
            muted
            width={640}
            height={480}
            className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute top-0 left-0"
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
