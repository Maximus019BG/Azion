"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";
import { Poppins } from "next/font/google";
import background from "../../public/background2.jpeg";
import { url } from "inspector";

interface Token {
  refreshToken: string;
  accessToken: string;
}

const headerText = Poppins({ subsets: ["latin"], weight: "900" });

const AxiosFunction = (data: any) => {
  axios
    .post(`${apiUrl}/auth/register`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(function (response: AxiosResponse) {
      const accessToken = response.data.accessToken;
      const refreshToken = response.data.refreshToken;
      window.location.href = "/organizations";
      localStorage.setItem("azionAccessToken", accessToken);
      localStorage.setItem("azionRefreshToken", refreshToken);
    })
    .catch(function (error: any) {
      console.log(error.response ? error.response : error);
    });
};

const SessionCheck = () => {
  const refreshToken: string | null = localStorage.getItem("azionRefreshToken");
  const accessToken: string | null = localStorage.getItem("azionAccessToken");

  const data: Token = {
    refreshToken: refreshToken ? refreshToken : "",
    accessToken: accessToken ? accessToken : "",
  };
  axios
    .post(`${apiUrl}/token/session/check`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(function (response: AxiosResponse) {
      const message = response.data.message;

      if (message === "newAccessToken generated") {
        const accessToken = response.data.accessToken;

        localStorage.setItem("azionAccessToken", accessToken);
        window.location.href = "/organizations";
      } else if (message === "success") {
        window.location.href = "/organizations";
      } else if (message === "sessionCheck failed") {
        localStorage.removeItem("azionAccessToken");
        localStorage.removeItem("azionRefreshToken");
      } else {
        localStorage.removeItem("azionAccessToken");
        localStorage.removeItem("azionRefreshToken");
      }
    })
    .catch(function (error: any) {
      // console.log(error.response ? error.response : error);
      if (error.response) {
        const message = error.response.data.message;

        if (message === "sessionCheck failed") {
          localStorage.removeItem("azionAccessToken");
          localStorage.removeItem("azionRefreshToken");
        } else {
          localStorage.removeItem("azionAccessToken");
          localStorage.removeItem("azionRefreshToken");
        }
      } else {
        console.log("An error occurred, but no server response was received.");
      }
    });
};
const Sign_up = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [role, setRole] = useState("");
  const [mfaEnabled, setMfaEnabled] = useState(false);

  //NEEDS useEffect
  useEffect(() => {
    SessionCheck();
  });

  const handleSubmit = () => {
    const userData = {
      name,
      email,
      age,
      password,
      role: "TestUser",
      mfaEnabled: true,
    };
    if (password === password2) {
      AxiosFunction(userData);
    }
  };
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
          className={` mt-6 text-neonAccent text-5xl md:text-6xl lg:text-7xl ${headerText.className}`}
        >
          Register
        </h1>
        <div className=" w-full flex flex-col justify- items-center gap-12">
          <div className="w-full  flex flex-col justify-center items-center gap-3">
            
            <input
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="   Enter your username:"
              className=" bg-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="   Input your Email:"
              className=" bg-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <input
              onChange={(e) => setAge(e.target.value)}
              placeholder="   Born At:"
              type="date"
              className=" pl-5 bg-background  opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <input
              onChange={(e) => setPassword(e.target.value)}
              placeholder="   Password:"
              type="password"
              className=" bg-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center gap-3">  
            <input
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="   Repeat Password:"
              type="password"
              className=" bg-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-background w-fit text-neonAccent hover:border-2 hover:border-neonAccent font-black px-56 py-3 rounded-3xl text-xl hover:scale-105 transition-all ease-in"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Sign_up;
