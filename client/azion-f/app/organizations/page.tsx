"use client";
import React, { useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";
import ListAllOrgs from "../components/listAllOrgs";


interface Token {
  refreshToken: string;
  accessToken: string;
}

const sessionCheck = () => {
  const refreshToken = localStorage.getItem('azionRefreshToken');
  const accessToken = localStorage.getItem('azionAccessToken');

  const data = { refreshToken, accessToken };

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
      }
    })
    .catch((error) => {
      console.error(error.response ? error.response : error);
      localStorage.removeItem('azionAccessToken');
      localStorage.removeItem('azionRefreshToken');
      window.location.href = '/log-in';
    });
};
const PartOfOrg = () => {
    const data = { token: localStorage.getItem('azionAccessToken') };
    axios.post(`${apiUrl}/org/partOfOrg`, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(function (response: AxiosResponse) {
            window.location.href = '/orgName';
        })
        .catch(function (error) {

        });
}

const Home = () => {
  useEffect(() => {
    const refreshToken = localStorage.getItem('azionRefreshToken');
    const accessToken = localStorage.getItem('azionAccessToken');
    if (refreshToken && accessToken) {
      sessionCheck();
      PartOfOrg();
    }
    else if(!accessToken && !refreshToken) {
        window.location.href = '/log-in';
    }
  }, []);

  return (
    <div className="neon-text h-screen w-screen bg-black overflow-x-hidden">
      Organizations
      <ListAllOrgs />

    </div>
  );
};

export default Home;