"use client";
import React, { useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";


interface Token {
  refreshToken: string;
  accessToken: string;
}

const sessionCheck = (data: Token) => {
  const url = `${apiUrl}/token/session/check`
  axios
    .post(url, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((response: AxiosResponse) => {
      const { message, accessToken } = response.data;

      if (message === 'newAccessToken generated') {
        localStorage.setItem('azionAccessToken', accessToken);
      } else if (message !== 'success') {


      }
    })
    .catch((error) => {
      console.error(error.response ? error.response : error);
      localStorage.removeItem('azionAccessToken');
      localStorage.removeItem('azionRefreshToken');
      window.location.href = '/log-in';
    });
};

const Home = () => {
  useEffect(() => {
    const refreshToken = localStorage.getItem('azionRefreshToken');
    const accessToken = localStorage.getItem('azionAccessToken');

    if (refreshToken && accessToken) {
      const data = { refreshToken, accessToken };
      sessionCheck(data);
    }
    else if(!accessToken && !refreshToken) {
        window.location.href = '/log-in';
    }
  }, []);

  return (
    <div className="neon-text h-screen w-screen bg-black overflow-x-hidden">
      organizations
    </div>
  );
};

export default Home;