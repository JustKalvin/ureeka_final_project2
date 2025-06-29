"use client";

import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

// Ganti ini dengan key asli kamu
const supabase = createClient("https://YOUR_PROJECT.supabase.co", "YOUR_ANON_KEY");

// Ganti ini dengan data dari session atau context
const dummyUser = {
  id: "USER_UUID_DI_SUPABASE",
};

const Journal = () => {
  const [text, setText] = useState<string>("");
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const checkToday = async () => {
      const { data, error } = await supabase
        .from("mood_journals")
        .select("sentiment, mood_text, created_at")
        .eq("user_id", dummyUser.id)
        .eq("created_at", today);

      if (data && data.length > 0) {
        setSubmitted(true);
        setResponse(
          JSON.stringify({ sentiment: data[0].sentiment, text: data[0].mood_text }, null, 2)
        );
      }
    };

    checkToday();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      // Panggil webhook ke server kamu
      const result = await axios.post("https://nominally-picked-grubworm.ngrok-free.app/webhook-test/journaling", {
        text: text,
      });

      const sentiment = result.data?.sentiment || "netral";

      // Simpan ke Supabase
      const { error: insertError } = await supabase.from("mood_journals").insert({
        user_id: dummyUser.id,
        mood_text: text,
        sentiment: sentiment,
        created_at: today,
      });

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        setError("Gagal menyimpan ke database.");
        return;
      }

      setResponse(JSON.stringify({ sentiment: sentiment, text: text }, null, 2));
      setError(null);
      setSubmitted(true);
    } catch (err: any) {
      console.error("Error submitting journal:", err);
      setError("Gagal mengirim jurnal. Silakan coba lagi.");
      setResponse(null);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Tulis Jurnal Harianmu 📝</h2>

      {submitted ? (
        <div className="p-4 border bg-green-50 text-green-800 rounded">
          <h3 className="font-semibold mb-2">Kamu sudah menulis hari ini!</h3>
          <pre className="whitespace-pre-wrap">{response}</pre>
        </div>
      ) : (
        <>
          <textarea
            value={text}
            onChange={handleChange}
            rows={6}
            className="w-full border p-2 rounded"
            placeholder="Bagaimana perasaanmu hari ini?"
          />

          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </>
      )}

      {error && (
        <div className="mt-4 p-2 border rounded bg-red-50 text-red-800">{error}</div>
      )}
    </div>
  );
};

export default Journal;
