"use client";
import React, {useEffect, useState} from 'react'
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

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = () => {
        console.log("TI SI")
    }

    useEffect(() => {
        const refreshToken = localStorage.getItem('azionRefreshToken');
        const accessToken = localStorage.getItem('azionAccessToken');

        

        if (refreshToken && accessToken) {
            const data = { refreshToken, accessToken };
            sessionCheck(data);
        }
    }, []);

  return (
    <div className="w-screen h-screen bg-background flex flex-col justify-center items-center">
      <div className="h-fit w-fit bg-accent rounded-xl opacity-80 flex flex-col gap-5 justify-center items-center p-5 md:p-10">
        <h1 className="text-3xl neon-text">Register</h1>
        <div className="w-full flex flex-col justify-center items-center gap-3">
          <p className="text-slate-200 w-96 flex flex-col justify-center items-start ml-7">
            Input your Username:
          </p>
          <input
            onChange={(e) => setName(e.target.value)}
            type="text"
            className=" bg-background opacity-100 w-full md:w-10/12 p-1 rounded-md"
          />
        </div>
        <div className="w-full flex flex-col justify-center items-center gap-3">
          <p className="text-slate-200 w-full flex flex-col justify-center items-start ml-4 md:ml-8 lg:ml-12">
            Input your Email:
          </p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className=" bg-background opacity-100 w-full md:w-10/12 p-1 rounded-md"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="bg-lightAccent w-full text-foreground px-4 py-2 rounded-md"
        >
          Submit
        </button>
      </div>
    </div>
  )
}

export default Log_in