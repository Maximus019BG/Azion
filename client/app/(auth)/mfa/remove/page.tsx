"use client";
import {useEffect} from "react";
import axios, {AxiosResponse} from "axios";
import Cookies from "js-cookie";
import OTP from "../../../components/OTP";
import {apiUrl} from "@/app/api/config";
import {mfaSessionCheck} from "@/app/func/funcs";

const RemMFAAxios = (data: any) => {
    axios
        .put(`${apiUrl}/mfa/rem`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(function (response: AxiosResponse) {
            Cookies.set("mfaChecked" + response.data.email, "true", {
                secure: true,
                sameSite: "Strict",
            });
            window.location.href = "/account";
        })
        .catch(function (error: any) {
            console.log(error.response ? error.response : error);
        });
};

const removeMFA = async (otp: string) => {
    const userData = {
        OTP: otp,
        accessToken: Cookies.get("azionAccessToken"),
    };
    if (!Cookies.get("azionAccessToken")) {
        window.location.href = "/login"
        return;
    } else if (otp.length !== 6) {
        console.log("OTP is invalid");
        return;
    } else {
        RemMFAAxios(userData);
    }
};

const MfaRemovePage = () => {


    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");
        if (refreshToken && accessToken) {
            mfaSessionCheck(true);
        } else {
            window.location.href = "/login";
        }

    }, []);

    return (
        <div className="h-dvh w-full flex flex-col justify-center items-center text-gray-400 px-4 overflow-x-hidden">
            <h1 className="text-4xl md:text-5xl font-black tracking-wide mt-16 text-lightAccent">Remove 2FA</h1>
            <ul className="text-center space-y-2 md:space-y-0">
                <li>To remove the 2FA enter the OTP code</li>
            </ul>
            <OTP length={6} onComplete={removeMFA}/>
            <div className="w-full flex flex-col justify-center items-center mt-10">
                <p className="text-center">
                    &bull; <span className="font-black text-lightAccent uppercase">NOW YOU CAN REMOVE</span> THE AZION ONLINE
                    FIELD FROM YOUR AUTHENTICATOR APP &bull;
                </p>
            </div>
        </div>
    );
};

export default MfaRemovePage;