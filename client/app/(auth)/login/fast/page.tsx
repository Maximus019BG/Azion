"use client";
import { useEffect, useRef, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "@/app/api/config";
import Cookies from "js-cookie";
import { Commissioner } from "next/font/google";
import { authSessionCheck } from "@/app/func/funcs";

const azionText = Commissioner({ subsets: ["latin"], weight: "800" });

export default function FastLogIn() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [imageSrc, setImageSrc] = useState("");
    const [altText, setAltText] = useState("");
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        if (Cookies.get("azionAccessToken") && Cookies.get("azionRefreshToken")) {
            authSessionCheck();
        }
    }, []);

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ video: true })
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

                const payload = { image: base64Image };

                try {
                    const response: AxiosResponse<{
                        accessToken: string;
                        refreshToken: string;
                    }> = await axios.post(
                        `${apiUrl}/auth/fast-login`,
                        { payload },
                        {
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    setAltText("Detected Face");
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
                } catch (error:any) {
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
            {showOverlay && <div className="absolute inset-0 bg-white z-50"></div>}
            <video
                className="rounded-full custom-oval"
                ref={videoRef}
                autoPlay
            ></video>
            <h1
                className={`text-white mb-5 text-5xl md:text-6xl lg:text-8xl ${azionText.className}`}
            >
                Azion<span className="text-lightAccent">Cam</span>.
            </h1>
            <button
                className="text-white bg-accent w-fit font-black text-2xl px-56 py-3 rounded-3xl hover:scale-105 transition-all ease-in"
                onClick={captureAndSendFrame}
            >
                Login
            </button>
        </div>
    );
}