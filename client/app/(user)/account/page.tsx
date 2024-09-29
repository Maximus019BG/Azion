"use client";
import React, {useEffect} from "react";
import Cookies from "js-cookie";
import {PartOfOrg, sessionCheck} from "@/app/func/funcs";
import SideMenu from "../../components/Side-menu";
import Badge from "../../components/BadgeTest";
import SessionCards from "@/app/components/Session-cards";
import Loading from "@/app/components/Loading";


const Account = () => {
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");
        if (refreshToken && accessToken) {
            sessionCheck();
            setTimeout(() => {
                PartOfOrg(true).then();
                setLoading(false);
            }, 1000);

        } else if (!accessToken && !refreshToken) {
            window.location.href = "/login";
        }
    }, []);

    return (
        <>
            {loading ? (
                <div className="w-screen h-screen flex justify-center items-center">
                    <Loading/>
                </div>
            ) : (
                <div className="w-screen h-screen flex">
                    <div className="w-1/4 h-full">
                        <SideMenu/>
                    </div>
                    <div className="w-full h-full flex gap-x-56 ">
                        <div className="w-1/2 p-4 ml-8 flex justify-center items-center">
                            <Badge/>
                        </div>
                        <div className="w-full p-4 flex justify-center items-center">
                            <SessionCards/>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Account;