"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { addUser } from "../../query"

export default function AuthStatus() {
  const { data: session } = useSession();

  useEffect(() => {
    // Panggil addUser jika user login dan ada nama
    if (session?.user?.name && session?.user?.email) {
      console.log(session.user.name, " and ", session.user.email)
      addUser(session.user.name, session.user.email).then((res) => {
        if (!res.success) {
          console.log("Add user result:", res.message);
        } else {
          console.log("User inserted:", res.data);
        }
      });
    }
  }, [session]);

  if (session) {
    return (
      <>
        <p>Welcome, {session.user?.name}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <div className="">
      <p>You are not signed in</p>
      <button onClick={() => signIn("google")}>Sign in with Google</button>
    </div>
  );
}
