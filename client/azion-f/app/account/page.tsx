"use client";
import React, { useEffect, useState, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "@/app/api/config";
import Cookies from "js-cookie";
import { CheckMFA, PartOfOrg, UserData } from "@/app/func/funcs";
import SideMenu from "../components/Side-menu";
import ProfilePicture from "../components/Profile-picture";
import EditProfile from "../components/EditProfile";

const SessionCheck = () => {
  const refreshToken = Cookies.get("azionRefreshToken");
  const accessToken = Cookies.get("azionAccessToken");
  PartOfOrg(false);
  const data = { refreshToken, accessToken };
  axios
    .post(`${apiUrl}/token/session/check`, data, {
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
      window.location.href = "/login";
    });
};

const Account = () => {
  useEffect(() => {
    const refreshToken = Cookies.get("azionRefreshToken");
    const accessToken = Cookies.get("azionAccessToken");
    if (refreshToken && accessToken) {
      SessionCheck();
    } else if (!accessToken && !refreshToken) {
      window.location.href = "/login";
    }
  });

  return (
    <div className="w-screen h-screen flex justify-center">
      <div className="w-fit h-full mr-10">
        <SideMenu />
      </div>
      <div className="w-full h-full flex flex-col justify-center items-start">
        <div className=" flex flex-col justify-center items-start gap-10">
          <div className=" ">
            <ProfilePicture />
          </div>
          <div className="">
            <EditProfile />
          </div>
        </div>
      </div>
       <div>

       </div>

    </div>
  );
};

export default Account;
