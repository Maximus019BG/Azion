"use client";
import React, {FC, useEffect, useState} from "react";
import SideMenu from "@/app/components/Side-menu";
import {CheckMFA, PartOfOrg, sessionCheck, UserData} from "@/app/func/funcs";
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
            sessionCheck();
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
        if (roleLevel !== 1) {
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
