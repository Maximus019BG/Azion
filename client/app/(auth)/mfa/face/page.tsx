"use client";
import React, { useEffect, useRef, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { apiUrl } from '@/app/api/config';
import { Commissioner } from "next/font/google";
import Cookies from 'js-cookie';
import {CheckMFA, mfaSessionCheck} from '@/app/func/funcs';
import Side_menu from "@/app/components/Side-menu";

interface Token {
    refreshToken: string;
    accessToken: string;
}

const azionText = Commissioner({ subsets: ["latin"], weight: "800" });

export default function MfaFace() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [showOverlay, setShowOverlay] = useState(false);

    CheckMFA(false);

    useEffect(() => {
        const refreshToken = Cookies.get('azionRefreshToken');
        const accessToken = Cookies.get('azionAccessToken');
        if (refreshToken && accessToken) {
            // mfaSessionCheck();
        } else if (!accessToken && !refreshToken) {
            window.location.href = '/login';
        }
    }, []);

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }).catch((err) => {
                console.error("Error accessing webcam: ", err);
            });
        }
    }, []);

    const captureAndSendFrame = async () => {
        if (videoRef.current) {
            setShowOverlay(true);
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const imageData = canvas.toDataURL('image/jpeg');
                const base64Image = imageData.split(',')[1];
                const accessToken = Cookies.get('azionAccessToken');

                const request = { accessToken };
                const payload = { image: base64Image };

                try {
                    const response: AxiosResponse<{ image: string }> = await axios.post(`${apiUrl}/mfa/face-scan`, { request, payload }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    const processedImage = `data:image/jpeg;base64,${response.data.image}`;
                    if (response.data.image === 'no faces detected') {
                    } else {
                        window.location.href = "/organizations";
                    }
                } catch (error) {
                    console.error("Error sending image to API: ", error);
                } finally {
                    setTimeout(() => setShowOverlay(false), 200); // Hide overlay after 200ms
                }
            }
        }
    };

    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center gap-16 bg-background relative">
            {showOverlay && <div className="absolute inset-0 bg-white z-50"></div>}
            <div className="absolute left-0 top-0">
                <Side_menu />
            </div>
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
                Save face
            </button>
        </div>
    );
}