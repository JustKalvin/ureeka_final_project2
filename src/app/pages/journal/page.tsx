"use client";

import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { getUsersByEmail, getJournal, insertJournal, users, journal, getAllJournal, updatePoint } from "../../query";
import { useSession } from "next-auth/react";
import { PlusCircle } from "lucide-react";
import Button from "../../components/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, XAxis, YAxis, Bar } from "recharts";


type sentiments = {
  positive: number;
  neutral: number;
  negative: number;
}

const Journal = () => {
  const { data: session } = useSession();
  const [text, setText] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [currUser, setCurrUser] = useState<users>();
  const [journals, setJournals] = useState<journal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [haveFillJournal, setHaveFillJournal] = useState<boolean>(false)
  const [seeJournals, setSeeJournals] = useState<boolean>(false)
  const [theSentiments, setTheSentiments] = useState<sentiments>()
  const [showPoints, setShowPoints] = useState<boolean>(false);


  useEffect(() => {
    if (session?.user?.email) getCurrUser();
  }, [session]);


  useEffect(() => {
    if (journals.length > 0) {
      sentimentsCounter();
    }
  }, [journals]);

  const getCurrUser = async () => {
    const result = await getUsersByEmail(session!.user!.email!);
    if (result.success && result.data) {
      setCurrUser(result.data);
      const journalResponse = await getJournal(result.data.id, today)
      if (journalResponse.success) setHaveFillJournal(haveFillJournal => (true))
      fetchJournals(result.data.id);
    }
  };

  const sentimentsCounter = () => {
    const count: sentiments = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    journals.forEach(j => {
      const sentiment = j.sentiment as keyof sentiments;
      if (count[sentiment] !== undefined) {
        count[sentiment] += 1;
      }
    });

    setTheSentiments(count);
  };


  const fetchJournals = async (user_id: number) => {
    const result = await getAllJournal(user_id);
    if (result.success && result.data) setJournals(result.data);
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      setHaveFillJournal(true)
      const result = await axios.post("https://nominally-picked-grubworm.ngrok-free.app/webhook/journaling", {
        text,
      });

      const sentiment = result.data.message.content.sentiment;
      const response = result.data.message.content.response;

      if (currUser?.id) {
        const journalResponse = await getJournal(currUser.id, today);
        if (!journalResponse.success) {
          await insertJournal(currUser.id, text, sentiment, response);
          if (session?.user?.email) {
            await updatePoint(session?.user?.email, 10)
          }
          setSubmitted(true);
          fetchJournals(currUser.id);
          setShowForm(false);
          setShowPoints(true); // Tampilkan "+10 Points"
          setTimeout(() => setShowPoints(false), 3000); // Sembunyikan setelah 3 detik
        }

      }
    } catch (err) {
      console.error("Error submitting journal:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-white p-6 relative flex flex-col items-center">
      <Button />
      {showPoints && (
        <div className="mt-4 text-green-600 font-bold text-3xl animate-bounce">
          +60 Points 🎉
        </div>
      )}
      <h2 className="mt-10 text-3xl font-bold mb-6 text-yellow-800">Mood Journal 📓</h2>
      {haveFillJournal ? (
        <div>
          <p className="text-yellow-700">You Have Fill The Journal Today, Thank You :D</p>
        </div>
      ) : (<button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 flex items-center gap-2 bg-white shadow px-4 py-2 rounded-full hover:bg-yellow-100"
      >
        <PlusCircle className="w-5 h-5 text-yellow-600" />
        <span className="text-yellow-800 font-medium">Tulis Jurnal</span>
      </button>)}

      {showForm && (
        <div className="w-full max-w-xl bg-white p-4 rounded-xl shadow">
          <textarea
            value={text}
            onChange={handleChange}
            rows={5}
            className="w-full border p-2 rounded text-yellow-600"
            placeholder="Bagaimana perasaanmu hari ini?"
          />
          <button
            onClick={handleSubmit}
            className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Submit
          </button>
        </div>
      )}


      <div className="flex justify-center my-4">
        <button
          onClick={() => setSeeJournals(prev => !prev)}
          className={`px-6 py-2 font-semibold rounded-full transition-colors duration-300
      ${seeJournals
              ? "bg-red-500 hover:bg-red-600 text-white shadow-md"
              : "bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-md"}`}
          aria-label={seeJournals ? "Close Journals" : "See Journals"}
        >
          {seeJournals ? "Close Journals" : "See Journals"}
        </button>
      </div>

      {seeJournals && (
        <div className="mt-10 w-full max-w-2xl">
          <h3 className="text-xl font-semibold mb-4 text-yellow-800">Previous Journals</h3>
          <div className="space-y-4">
            {journals.map((j) => (
              <div key={j.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{new Date(j.created_at).toLocaleDateString()}</span>
                  <span className="capitalize font-medium text-yellow-700">{j.sentiment}</span>
                </div>
                <p className="mt-2 text-gray-800 whitespace-pre-wrap">{j.mood_text}</p>
                <p className="mt-2 text-gray-800 whitespace-pre-wrap">Response : <br />{j.bot_response}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {theSentiments && (
        <div className="mt-12 bg-white p-6 rounded-xl shadow max-w-5xl w-full">
          <h3 className="text-xl font-semibold text-yellow-800 mb-6 text-center">
            Statistik Mood Kamu Minggu Ini
          </h3>

          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            {/* Pie Chart */}
            <div className="w-full md:w-1/2 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    isAnimationActive={true}
                    data={[
                      { name: 'Positif 😊', value: theSentiments.positive },
                      { name: 'Netral 😐', value: theSentiments.neutral },
                      { name: 'Negatif 😞', value: theSentiments.negative },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="#22c55e" /> {/* Green */}
                    <Cell fill="#facc15" /> {/* Yellow */}
                    <Cell fill="#ef4444" /> {/* Red */}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="w-full md:w-1/2 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Positif 😊', value: theSentiments.positive },
                    { name: 'Netral 😐', value: theSentiments.neutral },
                    { name: 'Negatif 😞', value: theSentiments.negative },
                  ]}
                >
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    <Cell fill="#22c55e" />
                    <Cell fill="#facc15" />
                    <Cell fill="#ef4444" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}




    </div>
  );
};

export default Journal;
