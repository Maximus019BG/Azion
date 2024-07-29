"use client";
import { useEffect, useRef, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Image from "next/image";
import { apiUrl } from '../api/config';

interface Token {
    refreshToken: string;
    accessToken: string;
}

const sessionCheck = () => {
    const refreshToken: string | null = localStorage.getItem("azionRefreshToken");
    const accessToken: string | null = localStorage.getItem("azionAccessToken");

    const data: Token = {
        refreshToken: refreshToken ? refreshToken : "",
        accessToken: accessToken ? accessToken : "",
    };
    axios
        .post(`${apiUrl}/token/session/check`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(function (response: AxiosResponse) {
            const message = response.data.message;

            if (message === "newAccessToken generated") {
                const accessToken = response.data.accessToken;

                localStorage.setItem("azionAccessToken", accessToken);
                window.location.href = "/organizations";
            } else if (message === "success") {
                window.location.href = "/organizations";
            } else if (message === "sessionCheck failed") {
                localStorage.removeItem("azionAccessToken");
                localStorage.removeItem("azionRefreshToken");
            } else {
                localStorage.removeItem("azionAccessToken");
                localStorage.removeItem("azionRefreshToken");
            }
        })
        .catch(function (error: any) {
            if (error.response) {
                const message = error.response.data.message;

                if (message === "sessionCheck failed") {
                    localStorage.removeItem("azionAccessToken");
                    localStorage.removeItem("azionRefreshToken");
                } else {
                    localStorage.removeItem("azionAccessToken");
                    localStorage.removeItem("azionRefreshToken");
                }
            } else {
                console.log("An error occurred, but no server response was received.");
            }
        });
};

export default function FastLogIn() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [imageSrc, setImageSrc] = useState('');
    const [altText, setAltText] = useState('');

    useEffect(() => {
        sessionCheck();
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
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const imageData = canvas.toDataURL('image/jpeg');
                const base64Image = imageData.split(',')[1];
                const accessToken: string | null = localStorage.getItem('azionAccessToken');

                const payload = { image: base64Image };

                try {
                    const response: AxiosResponse<{accessToken: string, refreshToken: string }> = await axios.post(`${apiUrl}/auth/fast-login`, { payload }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log("Response from API: ", response);

                    setAltText('Detected Face');

                    localStorage.setItem('azionAccessToken', response.data.accessToken);
                    localStorage.setItem('azionRefreshToken', response.data.refreshToken);
                    if(localStorage.getItem('azionAccessToken') && localStorage.getItem('azionRefreshToken')) {
                        sessionCheck();
                    }
                } catch (error) {
                    console.error("Error sending image to API: ", error);
                }
            }
        }
    };
    return (
        <>
            <video ref={videoRef} autoPlay></video>
            <button onClick={captureAndSendFrame}>Send Image</button>
            {imageSrc && <Image src={imageSrc} width={300} height={300} alt={altText}/>}
        </>
    );
}