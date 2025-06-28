import Link from "next/link";
import Button from "../../components/button";

const gamepage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-white">
      {/* Bagian atas (Button) */}
      <div className="pt-10 flex justify-center">
        <Button />
      </div>

      {/* Konten utama (tengah halaman) */}
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
        <h1 className="text-4xl font-bold text-gray-800 mb-12 text-center animate-pulse">
          Select Game Mode
        </h1>

        <div className="flex flex-col sm:flex-row gap-6">
          <Link href="/pages/game">
            <button className="flex items-center gap-2 px-10 py-4 bg-yellow-400 text-yellow-900 text-lg font-semibold rounded-xl shadow-lg hover:bg-yellow-500 transition duration-200 transform hover:scale-105">
              <img src="/assets/SinglePlayer.png" alt="Single Icon" className="w-12 h-12 animate-bounce" />
              SINGLE
            </button>
          </Link>

          <Link href="/pages/gameversus">
            <button className="flex items-center gap-2 px-10 py-4 bg-yellow-400 text-yellow-900 text-lg font-semibold rounded-xl shadow-lg hover:bg-yellow-500 transition duration-200 transform hover:scale-105">
              <img src="/assets/DualPlayer.png" alt="Single Icon" className="w-12 h-12 animate-bounce" />
              VERSUS
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default gamepage;
