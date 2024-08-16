"use client";
import React, { useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";
import ListAllOrgs from "../components/listAllOrgs";
import Cookies from 'js-cookie';
import Side_menu from "../components/Side-menu";


interface Token {
  refreshToken: string;
  accessToken: string;
}

const sessionCheck = () => {
  const refreshToken = Cookies.get('azionRefreshToken');
  const accessToken = Cookies.get('azionAccessToken');

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
        Cookies.set('azionAccessToken', accessToken, { secure: true, sameSite: 'Strict' });
      }
    })
    .catch((error) => {
      console.error(error.response ? error.response : error);
      Cookies.remove('azionAccessToken');
      Cookies.remove('azionRefreshToken');
      window.location.href = '/log-in';
    });
};

const PartOfOrg = () => {
  const data = { token: Cookies.get('azionAccessToken') };
  axios.post(`${apiUrl}/org/partOfOrg`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(function (response: AxiosResponse) {
      window.location.href = '/orgName';
    })
    .catch(function (error) {
      console.error(error.response ? error.response : error);
    });
}

const Organizations = () => {

  const [result, setResult] = React.useState([]);

  useEffect(() => {
    const refreshToken = Cookies.get('azionRefreshToken');
    const accessToken = Cookies.get('azionAccessToken');
    if (refreshToken && accessToken) {
      sessionCheck();
      PartOfOrg();
    }
    // else if (!accessToken && !refreshToken) {
    //   window.location.href = '/log-in';
    // }
  }, []);

  return (
    <div className="neon-text h-screen w-screen bg-black overflow-x-hidden flex justify-start items-start">
    <div className=""><Side_menu/></div>
      
      <ListAllOrgs />
    </div>
  );
};

export default Organizations;