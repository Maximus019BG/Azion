"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";
import background from "../../public/background2.jpeg";
import { Poppins } from "next/font/google";
import Cookies from "js-cookie";

const headerText = Poppins({ subsets: ["latin"], weight: "900" });

interface Token {
  refreshToken: string;
  accessToken: string;
}

const AxiosFunction = (data: any) => {
  axios
    .post(`${apiUrl}/auth/login`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(function (response: AxiosResponse) {
      const accessToken = response.data.accessToken;
      const refreshToken = response.data.refreshToken;
      window.location.href = "/organizations";
      Cookies.set("azionAccessToken", accessToken, {
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("azionRefreshToken", refreshToken, {
        secure: true,
        sameSite: "Strict",
      });
    })
    .catch(function (error: any) {
      console.log(error.response ? error.response : error);
    });
};

const SessionCheck = () => {
  const refreshToken = Cookies.get("azionRefreshToken");
  const accessToken = Cookies.get("azionAccessToken");

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
        Cookies.set("azionAccessToken", accessToken, {
          secure: true,
          sameSite: "Strict",
        });
        window.location.href = "/organizations";
      } else if (message === "success") {
        window.location.href = "/organizations";
      } else if (message === "sessionCheck failed") {
        Cookies.remove("azionAccessToken");
        Cookies.remove("azionRefreshToken");
      } else {
        Cookies.remove("azionAccessToken");
        Cookies.remove("azionRefreshToken");
      }
    })
    .catch(function (error: any) {
      if (error.response) {
        const message = error.response.data.message;

        if (message === "sessionCheck failed") {
          Cookies.remove("azionAccessToken");
          Cookies.remove("azionRefreshToken");
        } else {
          Cookies.remove("azionAccessToken");
          Cookies.remove("azionRefreshToken");
        }
      } else {
        console.log("An error occurred, but no server response was received.");
      }
    });
};

const YourOrg = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [OTP, setOtp] = useState("");

  useEffect(() => {
    const refreshToken = Cookies.get("azionRefreshToken");
    const accessToken = Cookies.get("azionAccessToken");

    if (refreshToken && accessToken) {
      SessionCheck();
    }
  }, []);
  const handleSubmit = () => {
    const userData = {
      email,
      password,
      OTP,
    };

    AxiosFunction(userData);
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
      <div className="h-fit w-fit gradient-form rounded-3xl flex flex-col justify-evenly items-center p-5 md:p-10">
        <h1
          className={` mt-6 text-neonAccent text-5xl md:text-6xl lg:text-7xl ${headerText.className}`}
        >
          Login
        </h1>
        <div className=" w-full flex flex-col justify- items-center gap-12">
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="   Input your Email:"
              className=" bg-background opacity-100 w-full md:w-10/12 p-3 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <input
              onChange={(e) => setPassword(e.target.value)}
              placeholder="   Password:"
              type="password"
              className=" bg-background opacity-100 w-full md:w-10/12 p-3 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Remember me</span>
            <input type="checkbox" defaultChecked className="checkbox" />
          </label>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-background w-fit text-neonAccent hover:border-2 hover:border-neonAccent font-black px-60 py-4 rounded-3xl text-xl hover:scale-105 transition-all ease-in"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default YourOrg;
