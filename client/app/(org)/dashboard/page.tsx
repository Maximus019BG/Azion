"use client";
import React, {FC, useEffect, useState} from 'react';
import {Poppins} from 'next/font/google';
import Cookies from 'js-cookie';
import SideMenu from '@/app/components/Side-menu';
import {sessionCheck, UserData} from '@/app/func/funcs';
import {getOrgName} from '@/app/func/org';
import Loading from '@/app/components/Loading';
import DashboardRow1 from "@/app/components/_Dashboard-Elements/Dashboard_Row_1";
import Calendar from "@/app/components/_Dashboard-Elements/Calendar";

const headerText = Poppins({subsets: ['latin'], weight: '900'});

const Dashboard = () => {
    const [displayName, setDisplayName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const refreshToken = Cookies.get('azionRefreshToken');
                const accessToken = Cookies.get('azionAccessToken');
                if (refreshToken && accessToken) {
                    await sessionCheck();
                    const [userData] = await Promise.all([
                        UserData(),
                    ]);
                    setDisplayName(userData.name);
                    setLoading(false);
                } else {
                    window.location.href = '/login';
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            {loading ? (
                <div className="w-screen h-screen flex justify-start items-center">
                    <Loading/>
                </div>
            ) : (
                <div className="w-full h-dvh flex overflow-hidden">
                    <div className="w-fit lg:w-1/4 h-full">
                        <SideMenu/>
                    </div>
                    <div className="w-full h-full flex flex-col justify-start items-start overflow-y-auto">
                        <h2 className={`${headerText.className} text-4xl text-white pl-10 pt-10`}>
                            Dashboard
                        </h2>
                        <div className="w-full h-full flex flex-col gap-10 justify-start items-start">
                            <DashboardRow1/>
                            <div className="w-full h-full">
                                <Calendar/>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;