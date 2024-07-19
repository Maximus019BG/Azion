import React from 'react';
import background from "../../public/background2.jpeg";
import { Poppins } from 'next/font/google';

const headerText = Poppins({ subsets: ["latin"], weight: "900" });

const Register_Organisation = () => {
  return (
    <div
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(30, 29, 29, 0.8), rgba(26, 25, 25, 0.7), rgba(22, 21, 21, 0.6), rgba(18, 17, 17, 0.5)), url(${background.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="w-screen h-screen flex flex-col justify-center items-center"
    >
      <div className="h-fit w-fit gradient-form rounded-3xl flex flex-col justify-around items-center p-5 md:p-10">
        <h1
          className={`mt-6 text-neonAccent text-5xl md:text-6xl lg:text-7xl ${headerText.className}`}
        >
          Register Org
        </h1>
        <div className="w-full flex flex-col justify-center items-center gap-12">
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <input
            //   onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Enter your username:"
              className="bg-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <input
            //   onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Input your Email:"
              className="bg-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <input
            //   onChange={(e) => setAge(e.target.value)}
              placeholder="Born At:"
              type="date"
              className="pl-5 bg-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <input
            //   onChange={(e) => setPassword(e.target.value)}
              placeholder="Password:"
              type="password"
              className="bg-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <input
            //   onChange={(e) => setPassword2(e.target.value)}
              placeholder="Repeat Password:"
              type="password"
              className="bg-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <label className="text-neonAccent">
              <input
                type="checkbox"
                // onChange={handleCheckboxChange}
                className="mr-2"
              />
              I&apos;m an organization owner
            </label>
          </div>
        </div>
        <button
        //   onClick={handleSubmit}
          className="bg-background w-fit text-neonAccent hover:border-2 hover:border-neonAccent font-black px-56 py-3 rounded-3xl text-xl hover:scale-105 transition-all ease-in"
        >
          Submit
        </button>
      </div>
    </div>
  )
}

export default Register_Organisation