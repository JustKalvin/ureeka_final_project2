'use client'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import Link from 'next/link'
import Button from "./components/button"
import { useSession } from 'next-auth/react'

const Page = () => {
  const { data: session } = useSession()
  if (session?.user?.email && session?.user?.name) {
    console.log(session.user.email, " and ", session.user.name)
  }

  return (
    <div className="min-h-screen w-full bg-yellow-50 flex flex-col items-center justify-center px-6 text-center">
      < Button />
      <DotLottieReact
        src="/animations/laugh.lottie"
        loop
        autoplay
        style={{ width: 400, height: 400 }}
      />
      <h1
        className="text-4xl md:text-5xl font-bold mt-6 text-gray-800"
      >
        Welcome To <span className='text-4xl md:text-5xl font-bold mt-6 animate-rgbText'>Laughing Face</span>
      </h1>
      <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-xl">
        Let's Laugh!
      </p>
      <Link href="/pages/gamepage">
        <button className="mt-8 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-xl shadow transition-all duration-300">
          Start Now
        </button>
      </Link>

      <style jsx>{`
  @keyframes rgbText {
    0% { color: rgb(255, 0, 0); }
    33% { color: rgb(0, 255, 0); }
    66% { color: rgb(0, 0, 255); }
    100% { color: rgb(255, 0, 0); }
  }

  .animate-rgbText {
    animation: rgbText 4s infinite;
  }
`}</style>
    </div>
  )
}

export default Page
