"use client";
import React, {FC, useEffect, useState} from "react";
import {Poppins} from "next/font/google";
import Cookies from "js-cookie";
import SideMenu from "../../../components/Side-menu";
import CircularProgress from "../../../components/diagram";
import {CheckMFA, sessionCheck, UserData} from "@/app/func/funcs";
import Loading from "../../../components/Loading";
import {getOrgName} from "@/app/func/org";

const headerText = Poppins({subsets: ["latin"], weight: "900"});

interface Token {
    refreshToken: string;
    accessToken: string;
}

interface PageProps {
    params: {
        org: string;
    };
}

const Dashboard: FC<PageProps> = ({params}) => {
    const [displayName, setDisplayName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [orgNameCheck, setOrgNameCheck] = useState<string>("");
    const orgName: string = params.org;
    CheckMFA(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const refreshToken = Cookies.get("azionRefreshToken");
                const accessToken = Cookies.get("azionAccessToken");
                if (refreshToken && accessToken) {
                    sessionCheck();
                    UserData().then((data) => {
                        setDisplayName(data.name);
                    });
                } else if (!accessToken && !refreshToken) {
                    window.location.href = "/login";
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchOrgName = async () => {
            const result: string = await getOrgName();
            setOrgNameCheck(result);
        };

        fetchOrgName();
    }, [orgName]);

    useEffect(() => {
        if (orgNameCheck && orgNameCheck !== orgName) {
            window.location.href = `/dashboard/${orgNameCheck}`;
        }
        setLoading(false);
    }, [orgNameCheck, orgName]);

    return (
        <>
            {loading ? (
                <div className="w-screen h-screen flex justify-center items-center">
                    <Loading/>
                </div>
            ) : (
                <div className="w-screen h-screen flex flex-col justify-center items-center">
                    <div className="absolute left-0">
                        <SideMenu/>
                    </div>
                    <h2>Organization {orgNameCheck}</h2>
                    <h1
                        className={`${headerText.className} w-[35vw] h-32 flex justify-center items-center text-foreground m-16 text-5xl`}
                    >
                        Hi, {displayName}!
                    </h1>

                    {/* Diagrams */}
                    <div className="flex justify-center items-center">
                        <CircularProgress percentage={35} size={200} strokeWidth={4}/>
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;