"use client";
import React, {useEffect} from "react";
import axios, {AxiosResponse} from "axios";
import {apiUrl} from "../api/config";
import {Poppins} from "next/font/google";
import Cookies from "js-cookie";
import {FaSignOutAlt} from "react-icons/fa";


interface Token {
    refreshToken: string;
    accessToken: string;
}

interface InputField<T> {
    label: string;
    value: T;
    onChange: (value: T) => void;
    type?: "text" | "email" | "date" | "password" | "checkbox";
    combinedWith?: string;
}

const headerText = Poppins({subsets: ["latin"], weight: "900"});


const LogOutAxios = () => {
    axios
        .post(`${apiUrl}/auth/logout`, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(function (response: AxiosResponse) {
            Cookies.remove("azionAccessToken");
            Cookies.remove("azionRefreshToken");
            window.location.href = "/login";
        })
        .catch(function (error: any) {
            Cookies.remove("azionAccessToken");
            Cookies.remove("azionRefreshToken");
            window.location.href = "/login";
        });

};

const SessionCheck = () => {
    const refreshToken: string | undefined = Cookies.get("azionRefreshToken");
    const accessToken: string | undefined = Cookies.get("azionAccessToken");

    const data: Token = {
        refreshToken: refreshToken ? refreshToken : "",
        accessToken: accessToken ? accessToken : "",
    };
    axios
        .post(`${apiUrl}/token/session/check`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(function (response: AxiosResponse) {
            const message = response.data.message;

            if (message === "newAccessToken generated") {
                const accessToken = response.data.accessToken;

                Cookies.set("azionAccessToken", accessToken, {
                    secure: true,
                    sameSite: "Strict",
                });
            } else if (message === "success") {
            } else if (message === "sessionCheck failed") {
                Cookies.remove("azionAccessToken");
                Cookies.remove("azionRefreshToken");
                window.location.href = "/login";
            } else {
                Cookies.remove("azionAccessToken");
                Cookies.remove("azionRefreshToken");
                window.location.href = "/login";
            }
        })
        .catch(function (error: any) {
            if (error.response) {
                const message = error.response.data.message;

                if (message === "sessionCheck failed") {
                    Cookies.remove("azionAccessToken");
                    Cookies.remove("azionRefreshToken");
                    window.location.href = "/login";
                } else {
                    Cookies.remove("azionAccessToken");
                    Cookies.remove("azionRefreshToken");
                    window.location.href = "/login";
                }
            } else {
                console.log("An error occurred, but no server response was received.");
            }
        });
};

const LogOut = () => {

    useEffect(() => {
        SessionCheck();
    }, []);

    return (
        <>
            <button className={"flex items-center gap-2 w-full p-2 rounded-md transition-colors"}
                    onClick={LogOutAxios}>
                <FaSignOutAlt className={"text-xl"}/> Log out
            </button>
        </>
    );
};

export default LogOut;
