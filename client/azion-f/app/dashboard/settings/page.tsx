"use client";
import React, {useEffect, useState} from 'react';
import SideMenu from "@/app/components/Side-menu";
import CircularProgress from "@/app/components/diagram";
import {CheckMFA,  PartOfOrg, UserData} from "@/app/func/funcs";
import Cookies from "js-cookie";
import {apiUrl} from "@/app/api/config";
import axios, {AxiosResponse} from "axios";
import {Poppins} from "next/font/google";
import OrgSettingsForm from "@/app/components/OrgSettings";
import {OrgConnString} from "@/app/func/org";
import Side_menu from "@/app/components/Side-menu";

const headerText = Poppins({ subsets: ["latin"], weight: "900" });


//Simo sega trqbva da izvikash UserData() i da proverish dali usera e owner ili admin na organizaciqta
//Ako e owner ili admin da ne stava nishto
//Ako ne e owner ili admin da go prenasochvash kum stranicata kym /dashboard
//Kogato si gotov tuk se prehvyrli na /client/azion-f/app/dashboard/task/page.tsx red 15

const SessionCheck = () => {
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
                    sameSite: "Strict",
                });
            }
        })
        .catch((error) => {
            console.error(error.response ? error.response : error);
            Cookies.remove("azionAccessToken");
            Cookies.remove("azionRefreshToken");
            window.location.href = '/login';
        });
};

const OrgSettings = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [conString, setConString] = useState<string>("");

    CheckMFA(false);
    PartOfOrg(true);

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");

        if (refreshToken && accessToken) {
            PartOfOrg(true).then();
            SessionCheck();
            setTimeout(() => {
                UserData().then((data) => {
                    setLoading(false);
                });
            }, 1000);
        } else if (!accessToken && !refreshToken) {
            window.location.href = '/login';
        }
    }, []);

    useEffect(() => {
        OrgConnString().then((data: string) => {
            setConString(data);
        }).catch((error) => {
            console.error(error);
        });
    }, []);
    return (
        <>
            <div className="absolute left-0 top-0">
                <Side_menu/>
            </div>
            {loading ? (
                <div className="w-screen h-screen flex justify-center items-center">
                    <h1
                        className={`${headerText.className} text-foreground m-16 text-5xl`}
                    >
                        Azion is loading
                    </h1>
                </div>
            ) : (
                <div className="w-screen h-screen flex flex-col justify-center items-center">
                    <OrgSettingsForm/>
                    <h2 className="text-foreground text-3xl text-white">
                        Connection String: {conString}
                    </h2>
                </div>

            )}
        </>
    )
}

export default OrgSettings;