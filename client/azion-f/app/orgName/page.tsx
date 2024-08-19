"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";
import background from "../../public/background2.jpeg";
import { Poppins } from "next/font/google";
import Cookies from "js-cookie";
import SideMenu from "../components/Side-menu";

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

      Cookies.set("azionAccessToken", accessToken, {
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("azionRefreshToken", refreshToken, {
        secure: true,
        sameSite: "Strict",
      });
      window.location.href = "/organizations";
    })
    .catch(function (error: any) {
      console.log(error.response ? error.response : error);
    });
};

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
      // window.location.href = '/log-in';
    });
};

const PartOfOrg = () => {
  const data = { accessToken: Cookies.get("azionAccessToken") };
  axios
    .post(`${apiUrl}/org/partOfOrg`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(function (response: AxiosResponse) {})
    .catch(function (error) {
      if (error.response && error.response.status === 500) {
      } else {
        console.error(error.response ? error.response : error);
      }
      window.location.href = "/organizations";
    });
};

const YourOrg = () => {
  useEffect(() => {
    const refreshToken = Cookies.get("azionRefreshToken");
    const accessToken = Cookies.get("azionAccessToken");

    if (refreshToken && accessToken) {
      SessionCheck();
      PartOfOrg();
    } else if (!accessToken && !refreshToken) {
      // window.location.href = '/log-in';
    }
  }, []);
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <div className="absolute left-0">
        <SideMenu />
      </div>
      <h1 className={`${headerText.className} text-foreground m-16 text-5xl`}>
        Hi, User
      </h1>
      <div className="w-[75vw] h-full flex justify-center items-center space-x-8">
        <div
          className="radial-progress text-primary"
          style={{ '--value': 70 } as React.CSSProperties}
          role="progressbar"
          data-progress="70%"
        >70%</div>
        <div
          className="radial-progress text-primary"
          style={{ '--value': 70 } as React.CSSProperties}
          role="progressbar"
          data-progress="70%"
        >70%</div>
        <div
          className="radial-progress text-primary"
          style={{ '--value': 70 } as React.CSSProperties}
          role="progressbar"
          data-progress="70%"
        >70%</div>
      </div>
    </div>
  );
};

export default YourOrg;
