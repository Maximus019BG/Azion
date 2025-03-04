"use client";
import React, {useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import {PartOfOrg, sessionCheck, UserData, UserHasRight} from "@/app/func/funcs";
import RoleList from "@/app/components/role-list";
import SideMenu from "@/app/components/Side-menu";
import ReturnButton from "@/app/components/ReturnButton";

const RoleEdit = () => {
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
                <div className="absolute top-4 sm:top-5 left-4 sm:left-5">
                    <ReturnButton hasOrg={false}/>
                </div>
                <RoleList/>
            </div>
        </div>
    );
}
export default RoleEdit;