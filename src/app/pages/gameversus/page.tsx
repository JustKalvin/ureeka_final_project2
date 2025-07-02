"use client";
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import Link from "next/link";
import Button from "../../components/button"
import { isReadable } from "stream";
import { useSession } from "next-auth/react"
import { updatePoint, getPunishment } from "../../query"
import ReactPlayer from 'react-player/youtube'

const gameversus = () => {
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
  const player1Laughed = useRef<boolean>(false);
  const player2Laughed = useRef<boolean>(false);
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [end, setEnd] = useState<boolean>(false);
  const [loser, setLoser] = useState<"Player 1" | "Player 2" | null>(null);
  // let punishments = [""];
  const punishments = useRef<any>([])

  const [selectedPunishment, setSelectedPunishment] = useState<string | null>(null);
  const [rollingPunishment, setRollingPunishment] = useState<string | null>(null);

  useEffect(() => {
    if (end && loser) {
      let counter = 0;
      const duration = 6000; // total 2 detik
      const intervalTime = 100;
      const totalTicks = duration / intervalTime;

      const finalIndex = Math.floor(Math.random() * punishments.current.length);
      const finalPunishment = punishments.current[finalIndex].punishment;

      const interval = setInterval(() => {
        const randomIdx = Math.floor(Math.random() * punishments.current.length);
        setRollingPunishment(punishments.current[randomIdx].punishment);
        counter++;
        if (counter >= totalTicks) {
          clearInterval(interval);
          setRollingPunishment(finalPunishment);
          setSelectedPunishment(finalPunishment);
        }
      }, intervalTime);
    }
  }, [end, loser]);


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
    fetchPunishment();
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

  const fetchPunishment = async () => {
    const tempPunishments = await getPunishment()
    console.log("Nih, punishments : ", tempPunishments.data)
    punishments.current = tempPunishments.data
  }

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
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections.length >= 2) {
          const sortedDetections = detections
            .sort((a, b) => a.detection.box.x - b.detection.box.x);

          const player1 = sortedDetections[0];
          const player2 = sortedDetections[1];

          const expressions1 = player1.expressions;
          const expressions2 = player2.expressions;

          // Misalnya: Threshold tertawa
          const isLaughing1 = expressions1.happy > 0.8;
          const isLaughing2 = expressions2.happy > 0.8;

          if (isLaughing1 && !player1Laughed.current) {
            player1Laughed.current = true;
            setRetryButton(true)
            setPlayer2Score(player2Score => (player2Score + elapsedTimeRef.current))
            // Simpan waktu & status Player 1
          }

          if (isLaughing2 && !player2Laughed.current) {
            player2Laughed.current = true;
            setRetryButton(true)
            setPlayer1Score(player1Score => (player1Score + elapsedTimeRef.current))
            // Simpan waktu & status Player 2
          }

          if (player1Laughed.current || player2Laughed.current) {
            if (timerRef.current) clearInterval(timerRef.current);

            const after = await captureExpression();
            if (after) {
              setAfterExp(after);
              haseCaptureAfterExp.current = true;
            }
            // if (player1Laughed.current) {
            //   setPlayer2Score(player2Score + elapsedTime)
            // }
            // if (player2Laughed.current) {
            //   setPlayer1Score(player1Score + elapsedTime)
            // }
          }

          // Update canvas (bounding box, label)
          const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          };

          faceapi.matchDimensions(canvasRef.current, displaySize);
          const resized = faceapi.resizeResults(sortedDetections, displaySize);

          const ctx = canvasRef.current.getContext("2d");
          ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          faceapi.draw.drawDetections(canvasRef.current, resized);

          // Tambah label Player 1 & Player 2
          resized.forEach((detection, i) => {
            const { x, y } = detection.detection.box;
            ctx!.fillStyle = i === 0 ? "red" : "blue";
            ctx!.font = "18px Arial";
            ctx!.fillText(`Player ${i + 1}`, x, y - 10);
          });
        }
      }
    }, 300);
  };


  const handleRetryButton = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setStatus("Game Started... Don't Laugh!");
    setRetryButton(false);
    setFaceStatus("Neutral");
    setElapsedTime(0);
    player1Laughed.current = false;
    player2Laughed.current = false;
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
    player1Laughed.current = false;
    player2Laughed.current = false;

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

  // const handlePlayerScore = (a: number, b: number) => {
  //   setPlayer1Score(player1Score + a)
  //   setPlayer2Score(player2Score + b)
  // }

  const handleEndButton = () => {
    setEnd(true);
    setRetryButton(false);

    if (player1Score > player2Score) {
      setLoser("Player 2");
    } else if (player2Score > player1Score) {
      setLoser("Player 1");
    } else {
      setLoser(null); // Draw
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-white p-6 relative flex flex-col items-center">
      <Button />
      <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-6 pt-16">{status}</h2>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-center mb-8">
        <p className="text-xl font-semibold text-gray-700 bg-white px-4 py-2 rounded shadow">
          🎮 Player 1 Score: <span className="text-green-600 font-bold">{player1Score}</span>
        </p>
        <p className="text-xl font-semibold text-gray-700 bg-white px-4 py-2 rounded shadow">
          🎮 Player 2 Score: <span className="text-green-600 font-bold">{player2Score}</span>
        </p>
      </div>

      {retryButton && (
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-purple-800 mb-4">🔁 Wanna Try Again?</h3>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleRetryButton}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retry
            </button>
            <button
              onClick={handleEndButton}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              End Game
            </button>
          </div>
        </div>

      )}

      <div className="flex flex-col md:flex-row gap-8 items-center justify-center mt-6">

        {/* Meme Video */}
        {end ? (
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-extrabold text-red-500 mb-6 animate-bounce">🏁 Game Over!</h1>
            {loser ? (
              <>
                <p className="text-xl text-gray-800 mb-2">
                  {loser} <span className="text-red-600 font-semibold">lost</span> the game!
                </p>
                <p className="text-lg text-gray-600 mb-3 italic">Punishment incoming... 🎯</p>
                <div className="text-2xl font-bold text-purple-700 bg-white px-6 py-4 rounded-lg shadow-md animate-pulse transition-all duration-300 ease-in-out">
                  {rollingPunishment}
                </div>
              </>
            ) : (
              <p className="text-2xl text-green-600 font-semibold">🤝 It's a draw! No punishment today 😎</p>
            )}
          </div>
        ) : (
          <div>
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
                  !player1Laughed.current && !player2Laughed.current ? (
                    <div className="w-full md:w-[720px]">
                      <h1 className="text-2xl font-semibold text-blue-500 mb-2">
                        ⏱️ Time Elapsed: <span className="font-bold">{formatTime(elapsedTime)}</span>
                      </h1>
                      <h3 className="text-xl font-semibold mb-2 text-gray-800">Watch Meme Video 👇</h3>
                      <p>Idx : {randomIdx}</p>
                      <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-gray-700 font-medium mb-2">{videoToShow?.title}</p>
                        <ReactPlayer
                          url={convertToEmbedURL(videoToShow?.url)}
                          // url="https://www.youtube.com/embed/DplROgfUZ7U"
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
                    player1Laughed.current ? (
                      <div>
                        <p>{`Player1 Laughed, Player2 WIN!`}</p>
                        <p>{`Player2 gain +${elapsedTime} scores!`}</p>
                      </div>
                    ) : (
                      <div>
                        <p>{`Player2 Laughed, Player1 WIN!`}</p>
                        <p>{`Player1 gain +${elapsedTime} scores!`}</p>
                      </div>
                    )
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
          </div>
        )}


        {/* Webcam & Canvas */}
        {end ? (null) : (
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
        )}

      </div>

    </div>
  );
}
export default gameversus;