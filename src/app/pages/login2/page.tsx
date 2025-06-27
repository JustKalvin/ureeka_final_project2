"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";
import { addUser } from "../../query"; // Ensure this path is correct
import Button from "../../components/button"

export default function AuthStatus() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Call addUser if the user is authenticated and has a name and email
    if (status === "authenticated" && session?.user?.name && session?.user?.email) {
      console.log(session.user.name, " and ", session.user.email);
      addUser(session.user.name, session.user.email).then((res) => {
        if (!res.success) {
          console.log("Add user result:", res.message);
        } else {
          console.log("User inserted:", res.data);
        }
      });
    }
  }, [session, status]); // Depend on session and status

  // Display a loading message while authentication status is being determined
  if (status === "loading") {
    return (
      <div className="auth-container">
        <p>Loading authentication status...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <div>
        <Button />
      </div>
      <div className="auth-container">
        {session ? (
          // UI when the user is signed in
          <>
            <p>
              Welcome, <b>{session.user?.name}</b>!
            </p>
            <button className="auth-button sign-out" onClick={() => signOut()}>
              Sign Out
            </button>
          </>
        ) : (
          // UI when the user is not signed in
          <>
            <p>You are not signed in.</p>
            <button className="auth-button sign-in" onClick={() => signIn("google")}>
              Sign In with Google
            </button>
          </>
        )}
      </div>

      {/* Styled JSX for component-specific styles */}
      <style jsx>{`
        .auth-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem; /* Larger padding for a more spacious feel */
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          background-color: #ffffff;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); /* Stronger, softer shadow */
          margin: 3rem auto; /* Generous top/bottom margin */
          max-width: 450px; /* Wider container */
          text-align: center;
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Modern font stack */
          color: #333;
          animation: fadeIn 0.8s ease-out; /* Simple fade-in animation */
        }

        .auth-container p {
          margin-bottom: 1.8rem; /* More space below text */
          font-size: 1.5em; /* Larger font size for prominence */
          font-weight: 500;
          line-height: 1.6;
          color: #2c3e50; /* Slightly darker text for contrast */
        }

        .auth-container p b {
          color: #007bff; /* Primary blue for the name */
          font-weight: 700;
        }

        .auth-button {
          background-color: #007bff; /* Primary blue */
          color: white;
          padding: 0.9rem 2.2rem; /* Adjusted padding */
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.1em;
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
          outline: none;
          min-width: 180px; /* Ensure minimum width for buttons */
        }

        .auth-button.sign-in {
            background-color: #4285F4; /* Google blue */
        }

        .auth-button.sign-out {
            background-color: #dc3545; /* Red for sign out */
        }

        .auth-button:hover {
          transform: translateY(-4px); /* More pronounced lift */
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); /* Stronger shadow on hover */
        }
        
        .auth-button.sign-in:hover {
            background-color: #357ae8;
        }

        .auth-button.sign-out:hover {
            background-color: #c82333;
        }

        .auth-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        /* Keyframe for fade-in animation */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .auth-container {
            padding: 2rem;
            margin: 2rem auto;
            max-width: 90%;
            border-radius: 10px;
          }
          .auth-container p {
            font-size: 1.25em;
            margin-bottom: 1.5rem;
          }
          .auth-button {
            padding: 0.8rem 2rem;
            font-size: 1em;
            min-width: unset; /* Remove min-width on smaller screens */
          }
        }

        @media (max-width: 480px) {
          .auth-container {
            padding: 1.5rem;
            margin: 1.5rem;
            border-radius: 8px;
          }
          .auth-container p {
            font-size: 1.1em;
            margin-bottom: 1rem;
          }
          .auth-button {
            padding: 0.7rem 1.5rem;
            font-size: 0.95em;
            width: 100%; /* Full width button on small screens */
          }
        }
      `}</style>
    </div>
  );
}