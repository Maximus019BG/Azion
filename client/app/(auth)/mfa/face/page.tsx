"use client";
import React, {useEffect, useRef, useState} from 'react';
import axios, {AxiosResponse} from 'axios';
import {apiUrl} from '@/app/api/config';
import {Commissioner} from "next/font/google";
import Cookies from 'js-cookie';
import Side_menu from "@/app/components/Side-menu";
import {UserData} from "@/app/func/funcs";

interface Token {
    refreshToken: string;
    accessToken: string;
}

const azionText = Commissioner({subsets: ["latin"], weight: "800"});

export default function MfaFace() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [showOverlay, setShowOverlay] = useState(false);
    const[isFaceIdEnabled, setIsFaceIdEnabled] = useState<boolean>(false)


    useEffect(() => {
        const refreshToken = Cookies.get('azionRefreshToken');
        const accessToken = Cookies.get('azionAccessToken');
        if (refreshToken && accessToken) {
        } else if (!accessToken && !refreshToken) {
            window.location.href = '/login';
        }

        //check if faceId is on
        UserData().then((response) => {
            setIsFaceIdEnabled(response.faceIdEnabled)
        });

        if(isFaceIdEnabled){
            window.location.href="/account"
        }
    });

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }).catch((err) => {
                console.error("Error accessing webcam: ", err);
            });
        }
    });

    const captureAndSendFrame = async () => {
        if (videoRef.current) {
            setShowOverlay(true);
            //Flash
            await new Promise((resolve) => setTimeout(resolve, 350));
            //Img
            const current = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = current.videoWidth;
            canvas.height = current.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(current, 0, 0, canvas.width, canvas.height);
                const imageData = canvas.toDataURL('image/jpeg');
                const base64Image = imageData.split(',')[1];
                const accessToken = Cookies.get('azionAccessToken');

                const request = {accessToken};
                const payload = {image: base64Image};

                try {
                    const response: AxiosResponse<{
                        image: string;
                    }> = await axios.post(`${apiUrl}/mfa/face-scan`, {request, payload}, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    const processedImage = `data:image/jpeg;base64,${response.data.image}`;
                    if (response.data.image === 'No faces detected') {
                        alert('No faces detected');
                    } else {
                        // window.location.href = "/account";
                    }
                } catch (error: any) {
                    console.error('Error sending image to API: ', error);
                    alert(error.response.data);
                } finally {
                    // Wait for another 0.1 seconds after capturing before removing the overlay
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    setShowOverlay(false);
                }
            }
        }
    };

    return (
        <div className="w-full h-dvh flex justify-center items-center bg-background">
            {showOverlay && <div className="absolute inset-0 bg-white z-50"></div>}
            <div className="w-fit lg:w-1/4 h-full">
                <Side_menu/>
            </div>
            <div className="w-full h-full flex flex-col justify-center items-center">
                <video
                    className="rounded-full custom-oval transform scale-x-[-1]"
                    ref={videoRef}
                    autoPlay
                ></video>
                <div className="flex flex-col justify-center items-center gap-3">
                    <h1
                        className={`text-white my-6 text-4xl sm:text-5xl md:text-6xl lg:text-8xl ${azionText.className}`}
                    >
                        Azion<span className="text-lightAccent">Cam</span>.
                    </h1>
                    <button
                        className="text-white bg-accent w-fit font-black text-lg sm:text-xl md:text-2xl lg:text-3xl px-6 sm:px-10 md:px-20 lg:px-56 py-3 rounded-3xl hover:scale-105 transition-all ease-in"
                        onClick={captureAndSendFrame}
                    >
                        Save face
                    </button>
                </div>
            </div>
        </div>
    );
}