"use client";
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import Link from "next/link";
import Button from "../../components/button"
import { isReadable } from "stream";
import { useSession } from "next-auth/react"
import { updatePoint } from "../../query"
import ReactPlayer from 'react-player/youtube'

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
  const isReadyRef = useRef<boolean>(false);
  const [beforeExp, setBeforeExp] = useState<any | null>(null);
  const [afterExp, setAfterExp] = useState<any | null>(null);
  const haseCaptureAfterExp = useRef<any | null>(null);
  const { data: session } = useSession();
  const elapsedTimeRef = useRef<number>(0);
  // useEffect(() => {
  //   const start = Date.now();
  //   setStartTime(start);

  //   timerRef.current = setInterval(() => {
  //     setElapsedTime(Math.floor((Date.now() - start) / 1000)); // dalam detik
  //   }, 1000);

  //   return () => {
  //     if (timerRef.current) clearInterval(timerRef.current);
  //   };
  // }, []);


  useEffect(() => {
    startVideo();
    loadModels();
    fetchMemeVideos();
    if (session?.user?.email && session?.user?.name) {
      console.log(session.user.email, " and ", session.user.name)
    }
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

          if (maxExp[0] === "happy" && maxExp[1] > 0.8 && isReadyRef.current === true && haseCaptureAfterExp.current === false) {
            const email = session?.user?.email;
            const finalTime = elapsedTimeRef.current;
            console.log("Your email : ", email, ", okay!")
            if (email && typeof finalTime === "number") {
              updatePoint(email, finalTime).then((res) => {
                if (!res.success) {
                  console.log("Failed to update point:", res.message);
                } else {
                  console.log("Point updated:", res.data);
                }
              });
            }

            setStatus("You laughed! You lost 😆.");
            setRetryButton(true);
            setFaceStatus("Happy");

            if (timerRef.current) clearInterval(timerRef.current);

            const after = await captureExpression();
            if (after) {
              setAfterExp(after);
              haseCaptureAfterExp.current = true;
            }
          }

        }
      }
    }, 300);
  };

  const handleRetryButton = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setStatus("Game Started... Don't Laugh!");
    setRetryButton(false);
    setFaceStatus("Neutral");
    setElapsedTime(0);

    const newStart = Date.now();
    setStartTime(newStart);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - newStart) / 1000);
      setElapsedTime(elapsed);
      elapsedTimeRef.current = elapsed;
    }, 1000);

    // Generate new random index
    if (memeVideo) {
      let rdm = Math.floor(Math.random() * memeVideo.length);
      while (rdm === randomIdx && memeVideo.length > 1) {
        rdm = Math.floor(Math.random() * memeVideo.length);
      }
      setRandomIdx(rdm);
    }
    const expressions = await captureExpression();
    if (expressions) {
      setBeforeExp(expressions);
      setAfterExp(null);
      haseCaptureAfterExp.current = false;
    }
  };



  const convertToEmbedURL = (url: string | undefined) => {
    if (!url || !url.startsWith("http")) return "";

    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");

      if (videoId) {
        // Pastikan URL embed YouTube yang benar dan tambahkan parameter
        // `autoplay=1` dan `mute=1` untuk memungkinkan autoplay di browser modern.
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
      }
      return url; // Fallback jika tidak ada videoId yang ditemukan
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

  // Fungsi ambil ekspresi dari screenshot
  const captureExpression = async (): Promise<any> => {
    if (!videoRef.current) return null;

    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (!detections) return null;

    const expressions = detections.expressions;
    return expressions;
  };


  const handleClickToStart = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    isReadyRef.current = true;
    const start = Date.now();
    setStartTime(start);
    setElapsedTime(0);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setElapsedTime(elapsed);
      elapsedTimeRef.current = elapsed;
    }, 1000);


    const expressions = await captureExpression();
    if (expressions) {
      setBeforeExp(expressions);
      setAfterExp(null);
      haseCaptureAfterExp.current = false;
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-white p-6 relative flex flex-col items-center">
      <Button />
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4 pt-20">{status}</h2>

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

      <div className="flex flex-col md:flex-row gap-8 items-center justify-center mt-6">

        {/* Meme Video */}
        {memeVideo && memeVideo.length > 0 ? (
          <div className="flex flex-col items-center justify-center">
            {!isReadyRef.current ? (
              <button
                onClick={(e) => handleClickToStart(e)}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition duration-200"
              >
                Click To Start
              </button>
            ) : (
              faceStatus === "Neutral" ? (
                <div className="w-full md:w-[720px]">
                  <h1 className={`text-3xl font-bold text-gray-800 opacity-10`}>
                    Time: {formatTime(elapsedTime)}
                  </h1>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Watch Meme Video 👇</h3>
                  <p>Idx : {randomIdx}</p>
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <p className="text-gray-700 font-medium mb-2">{videoToShow?.title}</p>
                    <ReactPlayer
                      url={convertToEmbedURL(videoToShow?.url)}
                      playing={true} // Ini yang mengaktifkan autoplay
                    />
                    {/* <iframe
                      width="100%"
                      height="400"
                      src={convertToEmbedURL(videoToShow?.url)}
                      title={videoToShow?.title}
                      frameBorder="0"
                      // Tambahkan allow="autoplay" di sini
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; autoplay"
                      allowFullScreen
                      className="rounded-md"
                    /> */}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xl text-red-600 font-bold mt-2">Your score: {elapsedTime}</p>
                  {afterExp && beforeExp && (
                    <div className="bg-white p-4 rounded-md mt-4 shadow-md">
                      <h4 className="text-gray-700 font-semibold mb-2">Mood Analysis 🧠</h4>
                      <p className="text-gray-800">
                        Ekspresi bahagia kamu meningkat dari{" "}
                        <strong>{(beforeExp.happy * 100).toFixed(1)}%</strong> ke{" "}
                        <strong>{(afterExp.happy * 100).toFixed(1)}%</strong>.{" "}
                        {afterExp.happy > beforeExp.happy ? "😊 Great job!" : "😐 Tetap semangat!"}
                      </p>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <p className="text-gray-600 text-lg font-semibold animate-pulse mt-10">
              Fetching Meme Videos...
            </p>
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mt-4"></div>
          </div>
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
}
export default Page;