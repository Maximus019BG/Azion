import React, {useEffect, useState} from "react";
import Cookies from "js-cookie";
import axios, {AxiosResponse} from "axios";
import {apiUrl} from "@/app/api/config";
import {FaDesktop, FaLaptop, FaMobileAlt} from "react-icons/fa";
import {DeleteSession} from "@/app/func/funcs";
import logo from "@/public/logo.png";
import Image from "next/image";
import {AnimatePresence, motion} from "framer-motion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";

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

const getPlatformIcon = (platform: string, isCurrentSession: boolean) => {
    const iconSize = "text-5xl";
    const iconClasses = `${iconSize} ${isCurrentSession ? "text-blue-500" : "text-gray-400"}`;

    if (platform.toLowerCase().includes("win") || platform.toLowerCase().includes("linux")) {
        return (
            <div
                className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-900/30 to-blue-800/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <FaDesktop className={iconClasses}/>
                {isCurrentSession && (
                    <div
                        className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-[#0f172a] animate-pulse"></div>
                )}
            </div>
        );
    } else if (platform.toLowerCase().includes("mac")) {
        return (
            <div
                className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-800/30 to-gray-700/10 shadow-[0_0_15px_rgba(156,163,175,0.3)]">
                <FaLaptop className={iconClasses}/>
                {isCurrentSession && (
                    <div
                        className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-[#0f172a] animate-pulse"></div>
                )}
            </div>
        );
    } else if (platform.toLowerCase().includes("android") || platform.toLowerCase().includes("ios")) {
        return (
            <div
                className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-900/30 to-green-800/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                <FaMobileAlt className={iconClasses}/>
                {isCurrentSession && (
                    <div
                        className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-[#0f172a] animate-pulse"></div>
                )}
            </div>
        );
    } else if (platform.toLowerCase().includes("azionmobile")) {
        return (
            <div
                className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-900/30 to-blue-800/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Image src={logo || "/placeholder.svg"} alt="AzionMobile" width={40} height={40}
                       className="rounded-md"/>
                {isCurrentSession && (
                    <div
                        className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-[#0f172a] animate-pulse"></div>
                )}
            </div>
        );
    }

    return (
        <div
            className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-800/30 to-gray-700/10">
            <FaDesktop className={iconClasses}/>
            {isCurrentSession && (
                <div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-[#0f172a] animate-pulse"></div>
            )}
        </div>
    );
};

const SessionCards = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [AzionMobile, setAzionMobile] = useState(false);
    const [sessionToRemove, setSessionToRemove] = useState<string | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

    const confirmRemoveSession = (token: string) => {
        setSessionToRemove(token);
        setShowConfirmDialog(true);
    };

    const handleRemoveSession = async () => {
        if (!sessionToRemove) return;

        const data = {
            accessToken: Cookies.get("azionAccessToken"),
            removeToken: sessionToRemove,
        };

        try {
            await axios.put(`${apiUrl}/token/sessions/delete/one`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setSessions((prevSessions) =>
                prevSessions.filter((session) => session.tokenDTO.token !== sessionToRemove)
            );
            setShowConfirmDialog(false);
            setSessionToRemove(null);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div
                className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-lg font-medium text-gray-300">Loading sessions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
                        Active Sessions
                    </h1>
                    <p className="text-gray-300 max-w-2xl mx-auto">
                        These are your currently active sessions across different devices. You can manage them below.
                    </p>
                    <div className="mt-6 inline-block">
                        <button
                            onClick={DeleteSession}
                            className="text-blue-400 hover:text-blue-300 underline decoration-blue-500/30 hover:decoration-blue-500/50 transition-all duration-200 text-sm flex items-center gap-2 mx-auto"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                            Remove all sessions except this one
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {sessions.map((session, index) => {
                            const isCurrentSession = session.tokenDTO.token === Cookies.get("azionRefreshToken");
                            const isMobileApp = session.platform === "AzionMobile";

                            return (
                                <motion.div
                                    key={index}
                                    initial={{opacity: 0, y: 20}}
                                    animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, scale: 0.95}}
                                    transition={{duration: 0.2, delay: index * 0.05}}
                                    className={`bg-[#1e293b]/40 backdrop-blur-sm border ${
                                        isCurrentSession ? "border-blue-500/30" : "border-gray-700/30"
                                    } rounded-xl shadow-lg overflow-hidden`}
                                >
                                    <div className={`p-6 ${isCurrentSession ? "bg-blue-900/10" : ""}`}>
                                        <div className="flex gap-6">
                                            {getPlatformIcon(session.platform, isCurrentSession)}

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-semibold text-white">
                                                        {session.platform}
                                                    </h3>
                                                    {isCurrentSession && (
                                                        <span
                                                            className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                              Current
                            </span>
                                                    )}
                                                    {isMobileApp && (
                                                        <span
                                                            className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                              Mobile App
                            </span>
                                                    )}
                                                </div>

                                                <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                                                    {session.tokenDTO.userAgent}
                                                </p>

                                                <div className="mt-4 flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                    <span className="text-xs text-gray-400">Active now</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <button
                                                onClick={() => confirmRemoveSession(session.tokenDTO.token)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                    isCurrentSession
                                                        ? "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
                                                        : "bg-red-500 text-white hover:bg-red-600"
                                                }`}
                                                disabled={isCurrentSession}
                                            >
                                                {isCurrentSession ? "Current Session" : "Remove Session"}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {sessions.length === 0 && (
                    <div className="text-center py-12">
                        <div
                            className="mx-auto w-16 h-16 rounded-full bg-blue-900/20 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Active Sessions</h3>
                        <p className="text-gray-400">You don't have any active sessions at the moment.</p>
                    </div>
                )}
            </div>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent className="bg-[#1e293b] border border-gray-700/50">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Remove Session</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                            Are you sure you want to remove this session? This will log out the device associated with
                            this session.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveSession}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SessionCards;
