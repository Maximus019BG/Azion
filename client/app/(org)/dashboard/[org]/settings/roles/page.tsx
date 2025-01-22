"use client";
import React, {FC, useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import {PartOfOrg, sessionCheck, UserData, UserHasRight} from "@/app/func/funcs";
import RoleList from "@/app/components/role-list";
import SideMenu from "@/app/components/Side-menu";
import {getOrgName} from "@/app/func/org";

interface PageProps {
    params: {
        org: string;
    };
}

const RoleEdit: FC<PageProps> = ({params}) => {
    const [loading, setLoading] = useState(true);
    const [orgNameCheck, setOrgNameCheck] = useState("");
    const orgName: string = params.org;

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
        UserHasRight(6);
        sessionCheck();
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
            window.location.href = `/dashboard/${orgNameCheck}/settings/roles`;
        }
    }, [orgNameCheck, orgName]);


    return (
        <div className="w-full min-h-screen flex flex-col lg:flex-row">
            <div className="w-full lg:w-1/4">
                <SideMenu/>
            </div>
            <div className="w-full flex justify-center items-center p-4 sm:p-6 md:p-8">
                <RoleList/>
            </div>
        </div>
    );
}
export default RoleEdit;