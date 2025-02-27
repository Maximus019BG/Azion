"use client";
import React, {useEffect, useState} from "react";
import SideMenu from "@/app/components/Side-menu";
import {PartOfOrg, sessionCheck, UserData, UserHasRight} from "@/app/func/funcs";
import Cookies from "js-cookie";
import {Poppins} from "next/font/google";
import OrgSettingsForm from "@/app/components/OrgSettings";
import Loading from "@/app/components/Loading";

const headerText = Poppins({subsets: ["latin"], weight: "900"});


const OrgSettings = () => {
    const [loading, setLoading] = useState<boolean>(true);

    PartOfOrg(true);

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");

        if (refreshToken && accessToken) {
            PartOfOrg(true).then();
            sessionCheck();
            setTimeout(() => {
                UserData().then((response) => {
                    setLoading(false);
                });
            }, 1000);
        } else if (!accessToken && !refreshToken) {
            window.location.href = "/login";
        }
    }, []);

    useEffect(() => {
        UserHasRight("settings:write");
        sessionCheck();
    });

    return (
        <>
            {loading ? (
                <div className="w-full h-dvh flex justify-center items-end">
                    <Loading/>
                </div>
            ) : (
                <div className="w-full h-dvh flex flex-col lg:flex-row overflow-y-hidden">
                    <div className="w-full lg:w-1/4 h-fit lg:h-full">
                        <SideMenu/>
                    </div>
                    <div className="w-full h-full flex justify-center items-center p-6 lg:p-10 overflow-auto">
                        <OrgSettingsForm/>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrgSettings;