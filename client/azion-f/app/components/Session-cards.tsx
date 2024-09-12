import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "@/app/api/config";
import { FaDesktop, FaLaptop, FaMobileAlt } from 'react-icons/fa';
import {DeleteSession} from "@/app/func/funcs";

interface TokenDTO {
    token: string;
    email: string;
    tokenType: string;
    userAgent: string;
}

interface Session {
    tokenDTO: TokenDTO;
    platform: string;
}

const getPlatformIcon = (platform: string) => {
    if (platform.toLowerCase().includes("win") || platform.toLowerCase().includes("linux")) {
        return <FaDesktop className="text-9xl mr-2 text-black" />;
    } else if (platform.toLowerCase().includes("mac")) {
        return <FaLaptop className="text-9xl mr-2 text-black" />;
    } else if (platform.toLowerCase().includes("android") || platform.toLowerCase().includes("ios")) {
        return <FaMobileAlt className="text-9xl mr-2 text-black" />;
    }
    return null;
};

const SessionCards = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const accessToken = Cookies.get("azionAccessToken");
                const response: AxiosResponse = await axios.get(`${apiUrl}/token/sessions/show/${accessToken}`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                setSessions(response.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                Cookies.remove("azionAccessToken");
                Cookies.remove("azionRefreshToken");
                window.location.href = '/login';
            }
        };

        fetchSessions();
    }, []);

    const removeSession = (token: string) => async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const data = { accessToken: Cookies.get("azionAccessToken"), removeToken: token };
        try {
            await axios.put(`${apiUrl}/token/sessions/delete/one`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4 w-screen ">
            <h1 className="text-2xl font-bold mb-4">Sessions</h1>
            <p className={"text-sm"}>&bull; You think your account is compromised <a onClick={DeleteSession} className={"cursor-pointer text-md text-neonAccent underline"}>remove all sessions except this one</a>&bull;</p>
            <div className="flex flex-col gap-4">
                {sessions.map((session, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md flex flex-col w-full md:w-1/2 lg:w-1/3">
                        <div className="flex items-center gap-4">
                            {getPlatformIcon(session.platform)}
                            <div>
                                <p className="text-sm text-gray-500"> {session.tokenDTO.userAgent}</p>
                                <p className="text-sm text-gray-500 mt-2">Platform: {session.platform}</p>
                                {session.tokenDTO.token === Cookies.get("azionRefreshToken") && (
                                    <p className="text-sm text-red-500">*Current Session</p>
                                )}
                            </div>
                        </div>
                        <button onClick={removeSession(session.tokenDTO.token)} className="mt-auto self-end px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
                            Remove Session
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SessionCards;