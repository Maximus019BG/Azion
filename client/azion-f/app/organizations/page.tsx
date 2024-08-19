"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";
import ListAllOrgs from "../components/listAllOrgs";
import Cookies from "js-cookie";
import Side_menu from "../components/Side-menu";

const sessionCheck = () => {
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
          sameSite: "None",
        });
      }
    })
    .catch((error) => {
      console.error(error.response ? error.response : error);
      Cookies.remove("azionAccessToken");
      Cookies.remove("azionRefreshToken");
      window.location.href = "/log-in";
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
    .then(() => {
      window.location.href = "/orgName";
    })
    .catch((error) => {
      if (error.response && error.response.status === 500) {
        // Handle 500 error
      } else {
        console.error(error.response ? error.response : error);
      }
    });
};

const Organizations = () => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const refreshToken = Cookies.get("azionRefreshToken");
    const accessToken = Cookies.get("azionAccessToken");
    if (refreshToken && accessToken) {
      sessionCheck();
      PartOfOrg();
    } else if (!accessToken && !refreshToken) {
      // Redirect to login if tokens are missing
      // window.location.href = '/log-in';
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
        <ListAllOrgs searchTerm={searchTerm} />
      </div>
    </div>
  );
};

export default Organizations;
