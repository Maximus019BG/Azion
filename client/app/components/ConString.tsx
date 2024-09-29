"use client";
import React, { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import axios from "axios";
import { apiUrl } from "../api/config";
import Cookies from "js-cookie";

interface ConStringProps {
  value: string;
  name: string;
}

const headerText = Poppins({ subsets: ["latin"], weight: "800" });

const ConString: React.FC<ConStringProps> = ({ value, name}) => {
  const toDashboard = () => {
    window.location.href = `/dashboard/${name}`;
  };
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-8 bg-slate-950 rounded-badge max-w-full">
      <h1
        className={`text-white max-w-2xl text-md md:text-xl lg:text-3xl text-center`}
      >
        <span className=" font-black text-lightAccent text-lg md:text-3xl lg:text-5xl">Congrats!!!</span> <br /> <br /> You have successfully created an organization!
      </h1>

      <div className=" flex flex-col justify-center items-center max-w-2xl gap-4">
        <h2
          className={`mt-6 text-white text-md md:text-xl lg:text-2xl text-center `}
        >
          Your connection string is: <span className=" mt-4 font-extrabold"> {value} </span>
        </h2>
        <p className="text-white text-center">
          With this connection string your employees can join
        </p>
      </div>

      <button
        onClick={toDashboard}
        className="mt-6 bg-lightAccent text-slate-50 font-extrabold p-2 px-10 text-xl rounded-full hover:bg-accent transition-all duration-300"
      >
        Go to dashboard
      </button>
    </div>
  );
};
export default ConString;
