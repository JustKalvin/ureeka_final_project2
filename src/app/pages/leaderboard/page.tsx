"use client";
import { useEffect, useState } from "react";
import { users, getUsers, getUsersByEmail } from "../../query";
import { useSession } from "next-auth/react";
import Button from "../../components/button"
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Leaderboard = () => {
  const [topUsers, setTopUsers] = useState<users[]>([]);
  const { data: session, status } = useSession();
  const [mine, setMine] = useState<users | any>({});
  const [point, setPoint] = useState<number>(0);

  useEffect(() => {
    handleGetUsers();
    // handleGetMine();
  }, []);

  useEffect(() => {
    handleGetMine();
  }, [status, session?.user?.email])

  const handleGetUsers = async () => {
    const result = await getUsers();
    if (result.success && Array.isArray(result.data)) {
      const sortedResult = result.data.sort((a, b) => b.point - a.point);
      setTopUsers(sortedResult);
    }
  };

  const handleGetMine = async () => {
    if (session?.user?.email) {
      // console.log("User : ", session.user.email)
      const result = await getUsersByEmail(session.user.email);
      // console.log("nih : ", result.data)
      // console.log("point : ", result.data?.point)
      setMine(result.data)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-white p-6 relative flex flex-col items-center">
      {/* Box user sendiri di pojok kanan atas */}
      <Button />
      <div className="absolute top-4 right-4 bg-yellow-200 border border-yellow-400 rounded-xl shadow-md px-4 py-2 text-sm text-yellow-800 transition duration-300 hover:shadow-lg">
        <p className="font-semibold">{mine?.name}</p>
        <p className="text-yellow-700">Points: {mine?.point}</p>
      </div>


      <h1 className="text-4xl font-bold mb-8 text-gray-800 animate-pulse mt-8">🏆 Top Users</h1>
      <div className="flex flex-row justify-center items-center">
        <div className="w-full max-w-md space-y-4">
          {topUsers.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 ${index === 0
                ? "bg-red-100 text-red-700 font-bold"
                : index === 1
                  ? "bg-yellow-100 text-yellow-700 font-semibold"
                  : index === 2
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "bg-white text-gray-800"
                }`}
            >
              <p className="text-lg">
                {index + 1}. {item.name} - {item.point}
              </p>
            </div>
          ))}
        </div>
        <DotLottieReact
          src="https://lottie.host/c7cec9c8-8dce-4a34-8c2a-5c4ae92bdefe/n88JXP81v4.lottie"
          loop
          autoplay
          style={{ scale: "1.5" }}
        />

      </div>
    </div>
  );
};

export default Leaderboard;
