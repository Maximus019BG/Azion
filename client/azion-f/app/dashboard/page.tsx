"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";
import { Poppins } from "next/font/google";
import Cookies from "js-cookie";
import SideMenu from "../components/Side-menu";
import CircularProgress from "../components/diagram";
import {CheckMFA, PartOfOrg, UserData} from "../func/funcs";


const headerText = Poppins({ subsets: ["latin"], weight: "900" });

interface Token {
  refreshToken: string;
  accessToken: string;
}

const SessionCheck = () => {
  const refreshToken = Cookies.get("azionRefreshToken");
  const accessToken = Cookies.get("azionAccessToken");

  const data = { refreshToken, accessToken };

  const url = `${apiUrl}/token/session/check`;
  axios
    .post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response: AxiosResponse) => {
      const { message, accessToken } = response.data;
      if (message === "newAccessToken generated") {
        Cookies.set("azionAccessToken", accessToken, {
          secure: true,
          sameSite: "Strict",
        });
      }
    })
    .catch((error) => {
      console.error(error.response ? error.response : error);
      Cookies.remove("azionAccessToken");
      Cookies.remove("azionRefreshToken");
      window.location.href = '/login';
    });
};

const Dashboard = () => {
  const [displayName, setDisplayName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  CheckMFA(false);
  PartOfOrg(true);



  useEffect(() => {
    const refreshToken = Cookies.get("azionRefreshToken");
    const accessToken = Cookies.get("azionAccessToken");

    if (refreshToken && accessToken) {
      PartOfOrg(true).then();
      SessionCheck();
      setTimeout(() => {
        UserData().then((data) => {
            setDisplayName(data.name);

            setLoading(false);
        });
      }, 1000);
    } else if (!accessToken && !refreshToken) {
       window.location.href = '/login';
    }
  }, []);

  return (
    <>
      {loading ? (
        <div className="w-screen h-screen flex justify-center items-center">
          <h1
            className={`${headerText.className} text-foreground m-16 text-5xl`}
          >
            Azion is loading
          </h1>
        </div>
      ) : (
        <div className="w-screen h-screen flex flex-col justify-center items-center">
          <div className="absolute left-0">
            <SideMenu />
          </div>
          <h1
            className={`${headerText.className} w-[35vw] h-32 flex justify-center items-center text-foreground m-16 text-5xl`}
          >
            Hi, {displayName}!
          </h1>

          {/* Diagrams */}
          <div className=" flex justify-center items-center">
            <CircularProgress percentage={35} size={200} strokeWidth={4} />
          </div>
        </div>
      )}
      ;
    </>
  );
};

export default Dashboard;
