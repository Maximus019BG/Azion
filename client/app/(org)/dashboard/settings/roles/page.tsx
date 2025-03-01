"use client";
import React, {FC, useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import {PartOfOrg, sessionCheck, UserData, UserHasRight} from "@/app/func/funcs";
import RoleList from "@/app/components/role-list";
import SideMenu from "@/app/components/Side-menu";
import {getOrgName} from "@/app/func/org";

const RoleEdit= () => {
    const [loading, setLoading] = useState(true);

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
        UserHasRight("roles:write");
        sessionCheck();
    });



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