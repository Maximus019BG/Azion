"use client";
import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import axios from 'axios';
import {apiUrl} from '@/app/api/config';
import Cookies from 'js-cookie';
import Link from 'next/link';
import {Cam} from '@/app/types/types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleLeft} from "@fortawesome/free-solid-svg-icons";
import {getOrgName} from "@/app/func/org";
import {sessionCheck, UserHasRight} from "@/app/func/funcs";

const CamListPage = () => {
    const [cams, setCams] = useState<Cam[]>([]);
    const [error, setError] = useState('');
    const [org, setOrg] = useState<string | null>(null);
    const router = useRouter();

    const fetchOrgName = async () => {
        const result: string = await getOrgName();
        if (result !== org) {
            setOrg(result);
        }
    };
    fetchOrgName();

    useEffect(() => {
        UserHasRight("cameras:read");
        sessionCheck();
    });
    useEffect(() => {
        const fetchCams = async () => {
            const accessToken = Cookies.get('azionAccessToken');
            if (!accessToken) {
                setError('Access Token is missing');
                return;
            }

            try {
                const response = await axios.get(`${apiUrl}/cam/all`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': accessToken
                    }
                });
                setCams(response.data);
            } catch (err) {
                setError('Failed to fetch cameras');
            }
        };

        fetchCams();
    }, []);

    const handleCamClick = (camName: string) => {
        router.push(`/cam/logs/${camName}`);
    };

    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="w-full h-screen flex flex-col justify-center items-center text-white relative p-4">
            <Link className="absolute top-6 left-6" href={`/dashboard/${org}`}>
                <FontAwesomeIcon className="text-3xl text-lightAccent" icon={faCircleLeft}/>
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-center">Camera List</h1>
            <div className="bg-base-300 p-6 rounded-lg shadow-lg w-full max-w-4xl overflow-auto">
                <ul className="list-disc space-y-2">
                    {cams.map((cam) => (
                        <li
                            key={cam.camName}
                            className="cursor-pointer text-gray-300 hover:text-white"
                            onClick={() => handleCamClick(cam.camName)}
                        >
                            {cam.camName}
                        </li>
                    ))}
                </ul>
            </div>
            <Link href="/cam/register">
                <p className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm sm:text-base md:text-lg lg:text-xl">
                    Register Camera
                </p>
            </Link>
        </div>
    );
};

export default CamListPage;