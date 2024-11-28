"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { apiUrl } from '@/app/api/config';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { Cam } from '@/app/types/types';

const CamListPage = () => {
    const [cams, setCams] = useState<Cam[]>([]);
    const [error, setError] = useState('');
    const router = useRouter();

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

    if (error) return <p>Error: {error}</p>;

    return (
        <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-900 text-white relative">
            <h1 className="text-4xl font-bold mb-6">Camera List</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl overflow-auto">
                <ul className="list-disc">
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
                <p className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Register Camera
                </p>
            </Link>
        </div>
    );
};

export default CamListPage;