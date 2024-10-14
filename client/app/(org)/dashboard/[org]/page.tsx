"use client"
import React, {FC, useEffect, useState} from 'react';
import {Poppins} from 'next/font/google';
import Cookies from 'js-cookie';
import SideMenu from '../../../components/Side-menu';
import {CheckMFA, sessionCheck, UserData} from '@/app/func/funcs';
import {getOrgName} from '@/app/func/org';
import Loading from '@/app/components/Loading';
import DashboardRow1 from "@/app/components/_Dashboard-Elements/Dashboard_Row_1";
import DashboardProgramCard from "@/app/components/_Dashboard-Elements/Dashboard_Program_Card";
import axios from "axios";
import {apiUrl} from "@/app/api/config";

const headerText = Poppins({subsets: ['latin'], weight: '900'});

interface Token {
    refreshToken: string;
    accessToken: string;
}

interface PageProps {
    params: {
        org: string;
    };
}

const Dashboard: FC<PageProps> = ({params}) => {
    const [displayName, setDisplayName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [orgNameCheck, setOrgNameCheck] = useState<string>('');
    const orgName: string = params.org;
    CheckMFA(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const refreshToken = Cookies.get('azionRefreshToken');
                const accessToken = Cookies.get('azionAccessToken');
                if (refreshToken && accessToken) {
                    sessionCheck();
                    UserData().then((data) => {
                        setDisplayName(data.name);
                    });
                } else if (!accessToken && !refreshToken) {
                    window.location.href = '/login';
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchOrgName = async () => {
            const result: string = await getOrgName();
            setOrgNameCheck(result);
        };

        fetchOrgName();
    }, [orgName]);

    useEffect(() => {
        if (orgNameCheck && orgNameCheck !== orgName) {
            window.location.href = `/dashboard/${orgNameCheck}`;
        }
        setLoading(false);
    }, [orgNameCheck, orgName]);

    useEffect(() => {
        const GetMeetings = () => {
            axios.get(`${apiUrl}/schedule/show/meetings`, {
                headers: {
                    "Content-Type": "application/json",
                    "authorization": Cookies.get("azionAccessToken")
                }
            }).then((response) => {
                console.log(response.data);
            }).catch((error) => {
                console.log(error);
            })
        }
        GetMeetings();
    }, []);

    return (
        <>
            {loading ? (
                <div className="w-screen h-screen flex justify-start items-center">
                    <Loading/>
                </div>
            ) : (
                <div className="w-screen h-screen flex overflow-y-hidden">
                    <div className="w-1/4 h-full">
                        <SideMenu/>
                    </div>
                    <div className="w-full h-full flex flex-col justify-start items-start overflow-y-auto">
                        <h2 className={`${headerText.className} text-4xl text-white pl-10 pt-10 w-full flex justify-start items-center`}>
                            Dashboard
                        </h2>
                        <div className="w-full h-full flex flex-col gap-10 justify-start items-start">
                            <DashboardRow1/>
                            <DashboardProgramCard/>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;