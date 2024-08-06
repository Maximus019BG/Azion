"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";
import { Poppins } from "next/font/google";
import Cookies from "js-cookie";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleLeft } from "@fortawesome/free-solid-svg-icons";

interface Token {
  refreshToken: string;
  accessToken: string;
}

const headerText = Poppins({ subsets: ["latin"], weight: "900" });

const AxiosFunction = (data: any, isOwner: boolean) => {
  axios
    .post(`${apiUrl}/auth/register`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(function (response: AxiosResponse) {
      const accessToken = response.data.accessToken;
      const refreshToken = response.data.refreshToken;
      if (!isOwner) {
        window.location.href = "/organizations";
      } else if (isOwner) {
        window.location.href = "/register-organization";
      }

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
  const refreshToken: string | undefined = Cookies.get("azionRefreshToken");
  const accessToken: string | undefined = Cookies.get("azionAccessToken");

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

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isOrgOwner, setIsOrgOwner] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    SessionCheck();
  }, []);

  const handleSubmit = () => {
    if (isOrgOwner) {
      setRole("owner");
    } else if (!isOrgOwner) {
      setRole("none");
    }
    const userData = {
      name,
      email,
      age,
      password,
      role,
      mfaEnabled: true,
    };
    if (password === password2) {
      AxiosFunction(userData, isOrgOwner);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsOrgOwner(e.target.checked);
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-1/2 h-full">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          preload="auto"
        >
          <source src="/azion.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="w-1/2 h-full flex flex-col justify-center items-center">
        <div className="h-full min-w-full bg-[#ebe9e5] flex flex-col justify-evenly items-center p-5 md:p-10">
        <Link className="absolute right-12 top-12" href="/">
            <FontAwesomeIcon className=" text-6xl text-lightAccent" icon={faCircleLeft} />
        </Link>
          <h1
            className={`mt-6 text-lightAccent text-5xl md:text-6xl lg:text-7xl ${headerText.className}`}
          >
            Register
          </h1>
          <div className="w-full flex flex-col justify-center items-center gap-8">
            <div className="w-full flex flex-col justify-center items-center gap-3">
              <input
                onChange={(e) => setName(e.target.value)}
                type="text"
                style={{ outline: "none" }}
                placeholder="Enter your username:"
                className="bg-[#ceccc8] text-black pl-6 h-12 placeholder:text-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#c0beba]"
              />
            </div>
            <div className="w-full flex flex-col justify-center items-center gap-3">
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="text"
                style={{ outline: "none" }}
                placeholder="Enter your username:"
                className="bg-[#ceccc8] text-black pl-6 h-12 placeholder:text-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#c0beba]"
              />
            </div>
            <div className="w-full flex flex-col justify-center items-center gap-3">
              <input
                onChange={(e) => setAge(e.target.value)}
                type="date"
                style={{ outline: "none" }}
                className="bg-[#ceccc8] text-black pl-6 h-12 placeholder:text-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#c0beba]"
              />
            </div>
            <div className="w-full flex flex-col justify-center items-center gap-3">
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                style={{ outline: "none" }}
                placeholder="Password:"
                className="bg-[#ceccc8] text-black pl-6 h-12 placeholder:text-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#c0beba]"
              />
            </div>
            <div className="w-full flex flex-col justify-center items-center gap-3">
              <input
                onChange={(e) => setPassword2(e.target.value)}
                type="password"
                style={{ outline: "none" }}
                placeholder="Repeat Password:"
                className="bg-[#ceccc8] text-black pl-6 h-12 placeholder:text-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#c0beba]"
              />
            </div>
            <div className="w-full  flex flex-col justify-center items-center gap-3">
              <label className="text-background">
                <input
                  type="checkbox"
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                I&apos;m an organization owner
              </label>
            </div>
          </div>
          <div className=" flex flex-col justify-center items-center gap-5">
            <button
              onClick={handleSubmit}
              className="bg-accent w-fit text-[#cbccc4] font-black px-56 py-3 rounded-3xl text-xl hover:scale-105 transition-all ease-in"
            >
              Submit
            </button>
            <h1 className="text-black">If you have an existing account go to <Link href="/log-in" className=" text-lightAccent hover:text-[#51bbb6] font-extrabold text-xl underline">Log-In</Link></h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
