"use client";
import React, {FC, useEffect, useState} from "react";
import SideMenu from "@/app/components/Side-menu";
import CircularProgress from "@/app/components/diagram";
import {CheckMFA, PartOfOrg, UserData} from "@/app/func/funcs";
import Cookies from "js-cookie";
import {apiUrl} from "@/app/api/config";
import axios, {AxiosResponse} from "axios";
import {Poppins} from "next/font/google";
import OrgSettingsForm from "@/app/components/OrgSettings";
import {OrgConnString, getOrgName} from "@/app/func/org";
import Loading from "@/app/components/Loading";

const headerText = Poppins({subsets: ["latin"], weight: "900"});

interface PageProps {
    params: {
        org: string;
    };
}

const SessionCheck = () => {
    const refreshToken = Cookies.get("azionRefreshToken");
    const accessToken = Cookies.get("azionAccessToken");

    const data = {refreshToken, accessToken};

    const url = `${apiUrl}/token/session/check`;
    axios
        .post(url, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((response: AxiosResponse) => {
            const {message, accessToken} = response.data;
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
            window.location.href = "/login";
        });
};

const OrgSettings: FC<PageProps> = ({params}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [conString, setConString] = useState<string>("");
    const [orgNameCheck, setOrgNameCheck] = useState<string>("");
    const [roleLevel, setRoleLevel] = useState<number>(0);
    const orgName: string = params.org;

    CheckMFA(false);
    PartOfOrg(true);

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");

        if (refreshToken && accessToken) {
            PartOfOrg(true).then();
            SessionCheck();
            setTimeout(() => {
                UserData().then((response) => {
                    setRoleLevel(response.roleLevel);
                    setLoading(false);
                });
            }, 1000);
        } else if (!accessToken && !refreshToken) {
            window.location.href = "/login";
        }
    }, []);


    useEffect(() => {
        const fetchOrgName = async () => {
            const result: string = await getOrgName();
            setOrgNameCheck(result);
        };
        fetchOrgName();
        if (orgNameCheck && orgNameCheck !== orgName) {
            window.location.href = `/dashboard/${orgNameCheck}/settings`;
        }
    }, [orgNameCheck, orgName]);

    if (!loading) {
        if (roleLevel < 1 && roleLevel > 3) {
            window.location.href = `/dashboard/${orgName}`;
        }
    }
    return (
        <>
            {loading ? (
                <div className="w-screen h-screen flex justify-center items-end">
                    <Loading/>
                </div>
            ) : (<>
                    <div className="absolute left-0 top-0 w-1/4">
                        <SideMenu/>
                    </div>
                    <div className="w-full h-screen flex flex-col justify-center items-center">
                        <div className="w-full max-w-3xl flex flex-col">
                            <OrgSettingsForm/>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default OrgSettings;
