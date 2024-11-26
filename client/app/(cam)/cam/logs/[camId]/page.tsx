"use client";
import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { apiUrl } from '@/app/api/config';
import Cookies from 'js-cookie';

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

    if (error) return <p>Error: {error}</p>;

    return (
    <div className="w-full h-dvh flex flex-col justify-center items-center bg-background">
        <h1 className="text-4xl font-black text-lightAccent">Camera Logs</h1>
        <pre className="text-gray-400 bg-black p-4 rounded w-full max-w-4xl overflow-auto">
            {logs.join('\n')}
        </pre>
    </div>
    );
};

export default CamLogsPage;