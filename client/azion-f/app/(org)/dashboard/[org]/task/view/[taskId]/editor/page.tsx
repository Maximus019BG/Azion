"use client";
import React, { FC, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "@/app/api/config";
import { Poppins } from "next/font/google";
import Cookies from "js-cookie";
import { CheckMFA, PartOfOrg, UserData } from "@/app/func/funcs";
import { getOrgName } from "@/app/func/org";
import Loading from "@/app/components/Loading";

const headerText = Poppins({ subsets: ["latin"], weight: "900" });

interface User {
    name: string;
    email: string;
    age: string;
    role: string;
    orgid: string;
    projects: any;
}



interface PageProps {
    params: {
        org: string;
    };
}

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
            window.location.href = "/login";
        });
};

const Tasks: FC<PageProps> = ({ params }) => {
    const [admin, setAdmin] = useState(false);
    const [orgNameCheck, setOrgNameCheck] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const orgName = params.org;

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");
        if (refreshToken && accessToken) {
            SessionCheck();
        } else if (!accessToken && !refreshToken) {
            window.location.href = "/login";
        }
    }, []);

    UserData().then((data) => {
        if (data.roleLevel > 0 && data.roleLevel < 3) {
            setAdmin(true);
        }
    });

    useEffect(() => {
        const fetchOrgName = async () => {
            const result: string = await getOrgName();
            setOrgNameCheck(result);
        };

        fetchOrgName();
    }, [orgName]);

    useEffect(() => {
        if (orgNameCheck && orgNameCheck !== orgName) {
            window.location.href = `/dashboard/${orgNameCheck}/task`;
        }
    }, [orgNameCheck, orgName]);

    if (loading) {
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                <Loading />
            </div>
        );
    }

    return (
        <div className="w-screen h-screen flex overflow-hidden">

        </div>
    );
};

export default Tasks;