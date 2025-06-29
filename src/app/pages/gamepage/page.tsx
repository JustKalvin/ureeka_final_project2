"use client"
import Link from "next/link";
import Button from "../../components/button";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const gamepage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-white" style={{ height: "1000px" }}>
      {/* Bagian atas (Button) */}
      <div className="pt-10 flex justify-center">
        <Button />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // width: "100vw",
          // height: "100vh",
        }}
      >
        <DotLottieReact
          src="https://lottie.host/b74f081d-0227-4636-8c46-70eb5c34a350/zQVByTu4oa.lottie"
          loop
          autoplay
          style={{ width: "600px", height: "auto", marginTop: "50px", marginBottom: "30px" }}
        />
      </div>

      {/* Konten utama (tengah halaman) */}
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-12 text-center animate-pulse">
          Select Game Mode
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
          <Link href="/pages/game">
            <button className="w-full h-32 flex flex-col items-center justify-center gap-2 px-6 py-4 bg-yellow-400 text-yellow-900 text-lg font-semibold rounded-xl shadow-lg hover:bg-yellow-500 transition duration-200 transform hover:scale-105 text-center">
              <img src="/assets/SinglePlayer.png" alt="Single Icon" className="w-12 h-12 animate-bounce" />
              TRY NO TO LAUGH SINGLE
            </button>
          </Link>

          <Link href="/pages/gameversus">
            <button className="w-full h-32 flex flex-col items-center justify-center gap-2 px-6 py-4 bg-yellow-400 text-yellow-900 text-lg font-semibold rounded-xl shadow-lg hover:bg-yellow-500 transition duration-200 transform hover:scale-105 text-center">
              <img src="/assets/DualPlayer.png" alt="Single Icon" className="w-12 h-12 animate-bounce" />
              TRY NO TO LAUGH VERSUS
            </button>
          </Link>

          <Link href="/pages/smilesimulation">
            <button className="w-full h-32 flex flex-col items-center justify-center gap-2 px-6 py-4 bg-yellow-400 text-yellow-900 text-lg font-semibold rounded-xl shadow-lg hover:bg-yellow-500 transition duration-200 transform hover:scale-105 text-center">
              <img src="/assets/happy.png" alt="Single Icon" className="w-12 h-12 animate-bounce" />
              SMILE HERE
            </button>
          </Link>

          <Link href="/pages/jokes">
            <button className="w-full h-32 flex flex-col items-center justify-center gap-2 px-6 py-4 bg-yellow-400 text-yellow-900 text-lg font-semibold rounded-xl shadow-lg hover:bg-yellow-500 transition duration-200 transform hover:scale-105 text-center">
              <img src="/assets/jokes.png" alt="Single Icon" className="w-12 h-12 animate-bounce" />
              FUNNY JOKES
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default gamepage;
