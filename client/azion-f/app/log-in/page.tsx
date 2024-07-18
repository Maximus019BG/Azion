"use client";
import React, {useEffect} from 'react'
import axios, {AxiosResponse} from "axios";
import { apiUrl } from '../api/config';

interface Token {
  refreshToken: string;
  accessToken: string;
}


const sessionCheck = (data: any) => {
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
            localStorage.removeItem('azionAccessToken');
            localStorage.removeItem('azionRefreshToken');
            window.location.href = '/log-in';
        });
};
const Log_in = () => {

    useEffect(() => {
        const refreshToken = localStorage.getItem('azionRefreshToken');
        const accessToken = localStorage.getItem('azionAccessToken');

        if (refreshToken && accessToken) {
            const data = { refreshToken, accessToken };
            sessionCheck(data);
        }
    }, []);

  return (
    <div>Log_in</div>
  )
}

export default Log_in