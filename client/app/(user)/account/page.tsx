"use client";
import React, {useEffect, useState} from "react";
import Cookies from "js-cookie";
import {PartOfOrg, sessionCheck} from "@/app/func/funcs";
import SideMenu from "../../components/Side-menu";
import Loading from "@/app/components/Loading";
import AccountUserCard from "@/app/components/AccountUserCard";
import AccountMfaCard from "@/app/components/AccountMfaCard";
import AccountDeleteCard from "@/app/components/AccountDeleteCard";


const Account = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const refreshToken = Cookies.get("azionRefreshToken");
                const accessToken = Cookies.get("azionAccessToken");
                if (refreshToken && accessToken) {
                    await sessionCheck();
                    setLoading(false);
                } else {
                    window.location.href = "/login";
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            {loading ? (
                <div className="w-screen h-screen flex justify-center items-center">
                    <Loading/>
                </div>
            ) : (
                <div className="w-full h-dvh flex flex-col lg:flex-row overflow-hidden">
                    <div className="lg:w-1/4 h-fit">
                        <SideMenu/>
                    </div>
                    <div className="w-full h-full flex flex-col items-center overflow-y-auto">
                        <div className="w-full flex flex-col justify-center items-center py-12 px-3 gap-8">
                            <AccountUserCard/>
                            <AccountMfaCard/>
                            <AccountDeleteCard/>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Account;