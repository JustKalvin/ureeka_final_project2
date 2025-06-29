"use client"
import { supabase } from "./lib/supabaseClient";

export type users = {
  id: number;
  name: string;
  point: number;
  role: string;
  email: string;
};

export type journal = {
  id: number;
  user_id: number;
  mood_text: string;
  sentiment: string;
  created_at: Date;
  bot_response: string;
}

export type jokes = {
  id: number;
  theJoke: string;
  counter: number;
}

type Result<T> = { success: boolean; data?: T; message?: string };

// Fungsi tambah user ke Supabase

export const getUsersByEmail = async (email: string): Promise<Result<users>> => {
  const { data, error } = await supabase.from("users").select("*").eq("email", email).limit(1)
  if (error) return { success: false, message: error.message }
  if (!data || data.length === 0) return { success: false, message: "data not found!" }
  return { success: true, data: data[0] }
}

export const getUsers = async (): Promise<Result<users[]>> => {
  const { data, error } = await supabase.from("users").select("*").limit(10)
  if (error) return { success: false, message: error.message }
  return { success: true, data: data }
}

export const addUser = async (name: string, email: string): Promise<Result<users>> => {
  const { data, error } = await supabase.from("users").select("*").eq("email", email).limit(1);
  if (error) return { success: false, message: error.message };
  if (data && data.length > 0) return { success: false, message: "User already exists!" };

  const { data: insertData, error: insertError } = await supabase
    .from("users")
    .insert({ name, email, point: 0, role: "user" })
    .select()
    .limit(1);

  if (insertError) return { success: false, message: insertError.message };
  return { success: true, data: insertData[0] };
};

export const updatePoint = async (email: string, point: number): Promise<Result<users>> => {
  const { data, error } = await supabase.from("users").select("point").eq("email", email).limit(1);
  if (error) return { success: false, message: error.message };
  if (!data || data.length === 0) return { success: false, message: "Data not found!" };

  const currentPoint = data[0].point ?? 0;
  console.log("Umm, ini point di supabase : ", currentPoint)
  const newPoint = currentPoint + point;
  console.log("Umm, ini point yang didapat : ", point, ", hasil : ", newPoint)


  const { data: updatedData, error: updateError } = await supabase
    .from("users")
    .update({ point: newPoint })
    .eq("email", email)
    .select();

  if (updateError) return { success: false, message: updateError.message };
  return { success: true, data: updatedData[0] };
};


export const insertJournal = async (
  user_id: number, // UUID dari Supabase users
  mood_text: string,
  sentiment: "positif" | "netral" | "negatif",
  bot_response: string
): Promise<Result<journal>> => {
  const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD

  // Cek apakah sudah pernah input hari ini
  const { data: existing, error: checkError } = await supabase
    .from("mood_journals")
    .select("*")
    .eq("user_id", user_id)
    .eq("created_at", today);

  if (checkError) return { success: false, message: checkError.message };
  if (existing && existing.length > 0) {
    return { success: false, message: "Kamu sudah mengisi jurnal hari ini!" };
  }

  // Simpan jurnal baru
  const { data: insertData, error: insertError } = await supabase
    .from("mood_journals")
    .insert([
      {
        user_id,
        mood_text,
        sentiment,
        created_at: today,
        bot_response // agar pasti hanya satu per hari
      },
    ])
    .select()
    .single();

  if (insertError) return { success: false, message: insertError.message };
  return { success: true, data: insertData };
};

export const getJournal = async (
  id: number, // user_id harus bertipe string (UUID)
  created_at: string // format: 'YYYY-MM-DD'
): Promise<Result<journal>> => {
  const { data, error } = await supabase
    .from("mood_journals")
    .select("*")
    .eq("user_id", id)
    .eq("created_at", created_at)
    .limit(1);

  if (error) return { success: false, message: error.message };
  if (!data || data.length === 0)
    return { success: false, message: "Belum ada jurnal hari ini" };

  return { success: true, data: data[0] };
};


export const getAllJournal = async (user_id: number): Promise<Result<journal[]>> => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const isoSevenDaysAgo = sevenDaysAgo.toISOString().split('T')[0]; // format yyyy-mm-dd

  const { data, error } = await supabase
    .from("mood_journals")
    .select("*")
    .eq("user_id", user_id)
    .gte("created_at", isoSevenDaysAgo)
    .order("created_at", { ascending: false });

  if (error) return { success: false, message: error.message };
  return { success: true, data };
};


export const getJokes = async (): Promise<Result<jokes[]>> => {
  const { data, error } = await supabase.from("jokes").select("*")
  if (error) return { success: false, message: error.message }
  return { success: true, data: data }
}

export const updateJokesCounter = async (id: number): Promise<Result<jokes>> => {
  const { data, error } = await supabase.from("jokes").select("*").eq("id", id).limit(1)
  if (error) return { success: false, message: error.message }
  if (!data || data.length <= 0) return { success: false, message: "data not found" }
  const theCounter = data[0].counter + 1
  const { data: updateData, error: updateError } = await supabase.from("jokes").update({ counter: theCounter }).eq("id", id).select()
  if (updateError) return { success: false, message: updateError.message }
  return { success: true, data: updateData[0] }
}