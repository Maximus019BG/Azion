"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../../api/config";
import { Poppins } from "next/font/google";
import Cookies from "js-cookie";
import {CheckMFA, PartOfOrg, UserData} from "../../func/funcs";


const headerText = Poppins({ subsets: ["latin"], weight: "900" });



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
            window.location.href = "/log-in";
        });
};


const CreateTask = () => {
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");
        if (refreshToken && accessToken) {
            SessionCheck();
        } else if (!accessToken && !refreshToken) {
            window.location.href = "/log-in";
        }
    }, []);

    UserData().then((data)=>{
        if(data.role=="owner" || data.role == "admin"){
            setAdmin(true)
        }
        else{
            window.location.href = "/task";
        }
    });
    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center">
            Create tasks here
        </div>
    );
};

export default CreateTask;
