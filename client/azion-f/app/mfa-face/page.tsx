"use client";
import { useEffect, useRef, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Image from "next/image";
import { apiUrl } from '../api/config';

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [imageSrc, setImageSrc] = useState('');

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

        try {
          const response: AxiosResponse<{ image: string }> = await axios.post(`${apiUrl}/mfa/face`, { image: base64Image }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          const processedImage = `data:image/jpeg;base64,${response.data.image}`;
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
      {imageSrc && <Image src={imageSrc} width={300} height={300} alt="Detected Face"/>}
    </>
  );
}