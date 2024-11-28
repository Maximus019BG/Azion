"use client";
import React, {useEffect, useState} from 'react';
import {usePathname, useSearchParams} from 'next/navigation';
import axios from 'axios';
import {apiUrl} from '@/app/api/config';
import Cookies from 'js-cookie';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleLeft} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

interface Log {
    logs: string;
}

const CamLogsPage = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const camId = pathname.split('/').pop();
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (camId) {
            const fetchLogs = async () => {
                const accessToken = Cookies.get('azionAccessToken');
                if (!accessToken) {
                    setError('Access Token is missing');
                    return;
                }

                try {
                    const response = await axios.get(`${apiUrl}/cam/logs/${camId}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': accessToken
                        }
                    });
                    if (response.data && response.data.logs) {
                        setLogs(response.data.logs.split('\n'));
                    } else {
                        setError('Logs data is not in the expected format');
                    }
                } catch (err) {
                    setError('Failed to fetch logs');
                }
            };

            fetchLogs();
        }
    }, [camId]);

    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="w-full h-screen flex flex-col justify-center items-center bg-background p-4">
            <Link className="absolute top-6 left-6" href="/cam/list">
                <FontAwesomeIcon className="text-3xl text-lightAccent" icon={faCircleLeft}/>
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-lightAccent mb-6 text-center">Camera
                Logs</h1>
            <pre
                className="text-gray-400 bg-black p-4 rounded w-full max-w-4xl overflow-auto text-xs sm:text-sm md:text-base lg:text-lg">
                {logs.join('\n')}
            </pre>
        </div>
    );
};

export default CamLogsPage;