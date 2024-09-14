import React, {useEffect, useState} from "react";
import Cookies from "js-cookie";
import axios, {AxiosResponse} from "axios";
import {apiUrl} from "@/app/api/config";
import {FaDesktop, FaLaptop, FaMobileAlt} from "react-icons/fa";
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
    if (
        platform.toLowerCase().includes("win") ||
        platform.toLowerCase().includes("linux")
    ) {
        return <FaDesktop className="text-8xl text-blue-500 self-center"/>;
    } else if (platform.toLowerCase().includes("mac")) {
        return <FaLaptop className="text-8xl text-gray-500 self-center"/>;
    } else if (
        platform.toLowerCase().includes("android") ||
        platform.toLowerCase().includes("ios")
    ) {
        return <FaMobileAlt className="text-8xl text-green-500 self-center"/>;
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
                const response: AxiosResponse = await axios.get(
                    `${apiUrl}/token/sessions/show/${accessToken}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                setSessions(response.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                Cookies.remove("azionAccessToken");
                Cookies.remove("azionRefreshToken");
                window.location.href = "/login";
            }
        };

        fetchSessions();
    }, []);

    const removeSession =
        (token: string) =>
            async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                const data = {
                    accessToken: Cookies.get("azionAccessToken"),
                    removeToken: token,
                };
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
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg font-medium text-gray-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-6 w-full max-w-4xl mx-auto flex flex-col gap-6">
            <h1 className="text-3xl font-bold text-white mb-4">Active Sessions</h1>
            <p className="text-md text-gray-600 mb-4">
                If you think your account is compromised, you can{" "}
                <a
                    onClick={DeleteSession}
                    className="cursor-pointer text-blue-500 underline hover:text-blue-700 transition-colors duration-200"
                >
                    remove all sessions except this one
                </a>
                .
            </p>
            <div className="flex flex-col gap-y-6">
                {sessions.map((session, index) => (
                    <div
                        key={index}
                        className="bg-white p-4 rounded-xl shadow-lg flex justify-center flex-col w-full"
                    >
                        <div className="flex gap-6 items-center justify-center mb-4">
                            {getPlatformIcon(session.platform)}
                            <div>
                                <p className="text-sm text-gray-500">
                                    {session.tokenDTO.userAgent}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Platform: {session.platform}
                                </p>
                                {session.tokenDTO.token === Cookies.get("azionRefreshToken") && (
                                    <p className="text-sm text-red-500 font-semibold">
                                        *Current Session
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={removeSession(session.tokenDTO.token)}
                                className="w-2/6 px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-200 -mt-10"
                            >
                                Remove Session
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SessionCards;
