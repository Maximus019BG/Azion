"use client";
import { useEffect, useRef, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Image from "next/image";
import { apiUrl } from '../api/config';
import Cookies from 'js-cookie';

interface Token {
  refreshToken: string;
  accessToken: string;
}

const sessionCheck = () => {
  const refreshToken = Cookies.get('azionRefreshToken');
  const accessToken = Cookies.get('azionAccessToken');

  const data = { refreshToken, accessToken };

  const url = `${apiUrl}/token/session/check`
  axios
    .post(url, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((response: AxiosResponse) => {
      const { message, accessToken } = response.data;

      if (message === 'newAccessToken generated') {
        Cookies.set('azionAccessToken', accessToken, { secure: true, sameSite: 'Strict' });
      }
    })
    .catch((error) => {
      console.error(error.response ? error.response : error);
      Cookies.remove('azionAccessToken');
      Cookies.remove('azionRefreshToken');
      window.location.href = '/log-in';
    });
};

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [imageSrc, setImageSrc] = useState('');
  const [altText, setAltText] = useState('');

  useEffect(() => {
    const refreshToken = Cookies.get('azionRefreshToken');
    const accessToken = Cookies.get('azionAccessToken');
    if (refreshToken && accessToken) {
      sessionCheck();
    }
    else if(!accessToken && !refreshToken) {
        window.location.href = '/log-in';
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
                    setAltText('No faces detected');
                } else {
                    setAltText('Detected Face');
                }
                setImageSrc(processedImage);
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