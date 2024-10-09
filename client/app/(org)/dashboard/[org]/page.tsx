'use client';
import React, {FC, useEffect, useState} from 'react';
import {Poppins} from 'next/font/google';
import Cookies from 'js-cookie';
import SideMenu from '../../../components/Side-menu';
import {CheckMFA, sessionCheck, UserData} from '@/app/func/funcs';
import {getOrgName} from '@/app/func/org';
import Loading from '@/app/components/Loading';
import DashBoard_Task_Card from '@/app/components/Dashboard_Task_Card';
import CircularProgress from "@/app/components/diagram";


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

    return (
        <>
            {loading ? (
                <div className="w-screen h-screen flex justify-center items-center">
                    <Loading/>
                </div>
            ) : (
                <div className="w-screen h-screen flex">
                    <div className="w-1/4">
                        <SideMenu/>
                    </div>
                    <div className="flex flex-col justify-center items-center w-full">
                        <h2 className={`${headerText.className} text-4xl text-white p-10 w-full flex justify-start items-center`}>
                            Dashboard
                        </h2>
                        <div className="w-full h-full flex justify-center items-center gap-6">
                            <DashBoard_Task_Card/>
                            <CircularProgress percentage={35}/>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;