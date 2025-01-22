"use client";
import React, {FC, useEffect, useState} from "react";
import SideMenu from "@/app/components/Side-menu";
import {PartOfOrg, sessionCheck, UserData, UserHasRight} from "@/app/func/funcs";
import Cookies from "js-cookie";
import {Poppins} from "next/font/google";
import OrgSettingsForm from "@/app/components/OrgSettings";
import {getOrgName} from "@/app/func/org";
import Loading from "@/app/components/Loading";

const headerText = Poppins({subsets: ["latin"], weight: "900"});

interface PageProps {
    params: {
        org: string;
    };
}

const OrgSettings: FC<PageProps> = ({params}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [orgNameCheck, setOrgNameCheck] = useState<string>("");
    const orgName: string = params.org;

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
        const fetchOrgName = async () => {
            const result: string = await getOrgName();
            setOrgNameCheck(result);
        };
        fetchOrgName();
        if (orgNameCheck && orgNameCheck !== orgName) {
            window.location.href = `/dashboard/${orgNameCheck}/settings`;
        }
    }, [orgNameCheck, orgName]);

    useEffect(() => {
        UserHasRight(1);
        sessionCheck();
    });

    return (
        <>
            {loading ? (
                <div className="w-screen h-screen flex justify-center items-end">
                    <Loading/>
                </div>
            ) : (
                <div className="w-screen h-screen flex flex-col lg:flex-row overflow-y-hidden">
                    <div className="w-full lg:w-1/4 h-full">
                        <SideMenu/>
                    </div>
                    <div className="w-full h-full flex justify-center items-center p-6 lg:p-10">
                        <OrgSettingsForm/>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrgSettings;