'use client'
import React from 'react';
import styled from 'styled-components';
// import  from "../../../public/assets/game.png"
import Link from 'next/link';

const Button: React.FC = () => {
  return (
    <StyledWrapper>
      <div className="button-container">
        <Link href="/">
          <button className="button">
            <svg
              className="icon"
              stroke="currentColor"
              fill="currentColor"
              strokeWidth={0}
              viewBox="0 0 1024 1024"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M946.5 505L560.1 118.8l-25.9-25.9a31.5 31.5 0 0 0-44.4 0L77.5 505a63.9 63.9 0 0 0-18.8 46c.4 35.2 29.7 63.3 64.9 63.3h42.5V940h691.8V614.3h43.4c17.1 0 33.2-6.7 45.3-18.8a63.6 63.6 0 0 0 18.7-45.3c0-17-6.7-33.1-18.8-45.2zM568 868H456V664h112v204zm217.9-325.7V868H632V640c0-22.1-17.9-40-40-40H432c-22.1 0-40 17.9-40 40v228H238.1V542.3h-96l370-369.7 23.1 23.1L882 542.3h-96.1z" />
            </svg>
          </button>
        </Link>
        <Link href="/pages/gamepage">
          <button className="button">
            <img
              src="/assets/game.png" // Ganti path sesuai lokasi gambar kamu
              alt="Search Icon"
              className="icon"
            />
          </button>
        </Link>

        <Link href="/pages/journal">
          <button className="button">
            <img
              src="/assets/Journal.png" // Ganti path sesuai lokasi gambar kamu
              alt="Search Icon"
              className="icon"
            />
          </button>
        </Link>

        <Link href="/pages/leaderboard">
          <button className="button">
            <img
              src="/assets/Leaderboard.png" // Ganti path sesuai lokasi gambar kamu
              alt="Search Icon"
              className="icon"
            />
          </button>
        </Link>

        <Link href="/pages/login">
          <button className="button">
            <svg
              className="icon"
              stroke="currentColor"
              fill="currentColor"
              strokeWidth={0}
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2.5a5.5 5.5 0 0 1 3.096 10.047 9.005 9.005 0 0 1 5.9 8.181.75.75 0 1 1-1.499.044 7.5 7.5 0 0 0-14.993 0 .75.75 0 0 1-1.5-.045 9.005 9.005 0 0 1 5.9-8.18A5.5 5.5 0 0 1 12 2.5ZM8 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z" />
            </svg>
          </button>
        </Link>


      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .button-container {
    display: flex;
    background-color: rgba(0, 0, 0);
    width: 250px;
    height: 40px;
    align-items: center;
    justify-content: space-around;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px,
    rgba(255, 255, 0, 0.3) 5px 10px 15px;
    transition: all 0.5s;
  }
  .button-container:hover {
    width: 300px;
    transition: all 0.5s;
  }

  .button {
    outline: 0 !important;
    border: 0 !important;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: all ease-in-out 0.3s;
    cursor: pointer;
  }

  .button:hover {
    transform: translateY(-3px);
  }

  .icon {
    font-size: 20px;
    width: 30px;
    height:30px;
  }
  
`;

export default Button;
