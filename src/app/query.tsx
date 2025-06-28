"use client"
import { supabase } from "./lib/supabaseClient";

export type users = {
  id: number;
  name: string;
  point: number;
  role: string;
  email: string;
};

type Result<T> = { success: boolean; data?: T; message?: string };

// Fungsi tambah user ke Supabase

export const getUsersByEmail = async (email: string): Promise<Result<users>> => {
  const { data, error } = await supabase.from("users").select("*").eq("email", email).limit(1)
  if (error) return { success: false, message: error.message }
  if (!data || data.length === 0) return { success: false, message: "data not found!" }
  return { success: true, data: data[0] }
}

export const getUsers = async (): Promise<Result<users[]>> => {
  const { data, error } = await supabase.from("users").select("*")
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
