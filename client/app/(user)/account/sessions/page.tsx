"use client";
import React, {useEffect, useState} from 'react';
import Cookies from "js-cookie";
import {sessionCheck} from "@/app/func/funcs";
import SessionCards from "@/app/components/Session-cards";
import Loading from "@/app/components/Loading";

const Page = () => {
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
                <div className="w-screen h-screen flex overflow-hidden">
                    <div className="w-full h-full flex flex-col items-center overflow-y-auto">
                        <SessionCards/>
                    </div>
                </div>
            )}
        </>
    );
};

export default Page;