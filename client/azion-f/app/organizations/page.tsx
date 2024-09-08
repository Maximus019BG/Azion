"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../api/config";
import ListAllOrgs from "../components/listAllOrgs";
import Cookies from "js-cookie";
import Side_menu from "../components/Side-menu";
import Join_Organization from "../components/JoinOrg";
import { CheckMFA,PartOfOrg } from "../func/funcs";

const sessionCheck = async () => {
  const refreshToken = Cookies.get("azionRefreshToken");
  const accessToken = Cookies.get("azionAccessToken");
  const data = { refreshToken, accessToken };

  CheckMFA(false);

  const url = `${apiUrl}/token/session/check`;
  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { message, accessToken } = response.data;
    if (message === "newAccessToken generated") {
      Cookies.set("azionAccessToken", accessToken, {
        secure: true,
        sameSite: "Strict",
      });
    }
    return true;
  } catch (error: any) {
    console.error(error.response ? error.response : error);
    Cookies.remove("azionAccessToken");
    Cookies.remove("azionRefreshToken");
    window.location.href = "/login";
    return false;
  }
};


const Organizations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showJoinOrg, setShowJoinOrg] = useState(false); // Moved here

  useEffect(() => {
    const CheckSessionAndOrg = async () => {
      const isSessionValid = await sessionCheck();
      if (isSessionValid) {
        await PartOfOrg(false);
      }
    };

    const refreshToken = Cookies.get("azionRefreshToken");
    const accessToken = Cookies.get("azionAccessToken");

    if (refreshToken && accessToken) {
      CheckSessionAndOrg().then();
    } else if (!accessToken && !refreshToken) {
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className="neon-text h-screen w-screen bg-black overflow-x-hidden flex flex-col items-center">
      <div className="absolute left-0 top-0">
        <Side_menu />
      </div>
      <div className="w-full flex flex-col items-center mt-8">
        <label className="input w-2/6 input-bordered flex items-center gap-2 mb-4">
          <input
            type="text"
            className="grow"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clipRule="evenodd"
            />
          </svg>
        </label>
        <div className=" mt-10">
          <ListAllOrgs searchTerm={searchTerm} />
        </div>
      </div>

      {/* Toggle Button */}
      <button
        className="fixed bottom-10 right-10 bg-lightAccent text-white p-3 rounded-full"
        onClick={() => setShowJoinOrg(!showJoinOrg)}
      >
        {showJoinOrg ? "Close Join Org" : "Join Organization"}
      </button>

      {/* Conditional Rendering of Join Organization */}
      {showJoinOrg && (
        <div className="fixed inset-32 flex justify-center items-center z-50">
          <Join_Organization />
        </div>
      )}
    </div>
  );
};

export default Organizations;
