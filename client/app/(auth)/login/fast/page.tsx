"use client";
import React, {useEffect, useRef, useState} from "react";
import axios, {AxiosResponse} from "axios";
import {apiUrl} from "@/app/api/config";
import Cookies from "js-cookie";
import {Commissioner} from "next/font/google";
import {authSessionCheck} from "@/app/func/funcs";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleLeft} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const azionText = Commissioner({subsets: ["latin"], weight: "800"});

export default function FastLogIn() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        if (Cookies.get("azionAccessToken") && Cookies.get("azionRefreshToken")) {
            authSessionCheck();
        }
    }, []);

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({video: true})
                .then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch((err) => {
                    console.error("Error accessing webcam: ", err);
                });
        }
    }, []);

    const captureAndSendFrame = async () => {
        if (videoRef.current) {
            setShowOverlay(true);
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext("2d");
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const imageData = canvas.toDataURL("image/jpeg");
                const base64Image = imageData.split(",")[1];
                const accessToken: string | undefined = Cookies.get("azionAccessToken");

                const payload = {image: base64Image};

                try {
                    const response: AxiosResponse<{
                        accessToken: string;
                        refreshToken: string;
                    }> = await axios.post(
                        `${apiUrl}/auth/fast-login`,
                        {payload},
                        {
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    Cookies.set("azionAccessToken", response.data.accessToken, {
                        secure: true,
                        sameSite: "Strict",
                    });
                    Cookies.set("azionRefreshToken", response.data.refreshToken, {
                        secure: true,
                        sameSite: "Strict",
                    });
                    if (
                        Cookies.get("azionAccessToken") &&
                        Cookies.get("azionRefreshToken")
                    ) {
                        authSessionCheck();
                    }
                } catch (error: any) {
                    console.error("Error sending image to API: ", error);
                    alert(error.response.data);
                } finally {
                    setTimeout(() => setShowOverlay(false), 200); // Hide overlay after 200ms
                }
            }
        }
    };

    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center gap-16 bg-background relative">
            <Link className="absolute top-4 left-4" href="/login">
                <FontAwesomeIcon
                    className="text-3xl md:text-4xl text-lightAccent"
                    icon={faCircleLeft}
                />
            </Link>
            {showOverlay && <div className="absolute inset-0 bg-white z-50"></div>}
            <video
                className="rounded-full"
                ref={videoRef}
                autoPlay
            ></video>
            <div className="flex flex-col justify-center items-center gap-3">
                <h1
                    className={`text-white my-3 text-4xl sm:text-5xl md:text-6xl lg:text-8xl ${azionText.className}`}
                >
                    Azion<span className="text-lightAccent">Cam</span>.
                </h1>
                <button
                    className="text-white bg-accent w-fit font-black text-lg sm:text-xl md:text-2xl lg:text-3xl px-6 sm:px-10 md:px-20 lg:px-56 py-3 rounded-3xl hover:scale-105 transition-all ease-in"
                    onClick={captureAndSendFrame}
                >
                    Login
                </button>
            </div>
        </div>
    );
}