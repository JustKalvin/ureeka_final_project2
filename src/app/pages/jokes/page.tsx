"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getJokes, updateJokesCounter, updatePoint } from "../../query";
import Button from "../../components/button"
import { useSession } from "next-auth/react";
import Footer from "../../components/Footer"

type Joke = {
  id: number;
  thejoke: string;
  counter: number;
};

const JokesPage = () => {
  const { data: session, status } = useSession();
  const [jokes, setJokes] = useState<Joke[] | any>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [showPointMessage, setShowPointMessage] = useState(false);


  useEffect(() => {
    const fetchJokes = async () => {
      const result = await getJokes();
      if (result.success && result.data) {
        const shuffled = result.data.sort(() => Math.random() - 0.5);
        setJokes(shuffled);
      }
      setLoading(false);
    };

    fetchJokes();
  }, []);

  const handleLike = async () => {
    triggerPointMessage();
    setDirection("left");
    const currentJoke = jokes[currentIndex];
    await updateJokesCounter(currentJoke.id);
    nextJoke();

    if (session?.user?.email) {
      await updatePoint(session.user.email, 1);
    }
  };

  const handleDislike = async () => {
    triggerPointMessage();
    setDirection("right");
    nextJoke();

    if (session?.user?.email) {
      await updatePoint(session.user.email, 1);
    }
  };

  const triggerPointMessage = () => {
    setShowPointMessage(true);
    setTimeout(() => {
      setShowPointMessage(false);
    }, 500); // 2 detik
  };



  const nextJoke = () => {
    const randomIdx = Math.floor(Math.random() * jokes.length)
    setCurrentIndex(currentIndex => (randomIdx))
    // if (currentIndex < jokes.length - 1) {
    //   setCurrentIndex(currentIndex + 1);
    // } else {
    //   alert("That's all the jokes!");
    // }
  };

  if (loading) return <p className="text-center mt-10 text-gray-700">Loading jokes...</p>;
  if (jokes.length === 0) return <p className="text-center mt-10 text-gray-700">No jokes available.</p>;

  const currentJoke = jokes[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-white p-6">
      {/* Tombol di atas tengah */}
      <div className="w-full flex justify-center mb-4">
        <Button />
      </div>


      {/* Konten utama ditengah-tengah halaman */}
      <div className="flex flex-col items-center justify-center mt-20">
        {showPointMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-green-700 font-semibold text-lg"
          >
            +1 Point
          </motion.div>
        )}
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Funny Jokes #{currentJoke.id}</h1>

        <div className="relative w-full max-w-xl h-48 flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentJoke.id}
              initial={{ x: direction === "left" ? 300 : -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction === "left" ? -300 : 300, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute bg-white shadow-xl rounded-xl p-6 text-center text-lg text-gray-700 w-full"
            >
              {currentJoke.thejoke}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleLike}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow"
          >
            😂 Like
          </button>
          <button
            onClick={handleDislike}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow"
          >
            😐 Dislike
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JokesPage;
