"use client";
import { useEffect, useRef, useState } from "react";
import axios, { AxiosResponse } from "axios";
import Image from "next/image";
import { apiUrl } from "@/app/api/config";
import Cookies from "js-cookie";
import { Commissioner } from "next/font/google";

interface Token {
  refreshToken: string;
  accessToken: string;
}

const azionText = Commissioner({ subsets: ["latin"], weight: "800" });

const sessionCheck = () => {
  const refreshToken: string | undefined = Cookies.get("azionRefreshToken");
  const accessToken: string | undefined = Cookies.get("azionAccessToken");

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

        Cookies.set("azionAccessToken", accessToken, {
          secure: true,
          sameSite: "Strict",
        });
        window.location.href = "/organizations";
      } else if (message === "success") {
        window.location.href = "/organizations";
      } else if (message === "sessionCheck failed") {
        Cookies.remove("azionAccessToken");
        Cookies.remove("azionRefreshToken");
      } else {
        Cookies.remove("azionAccessToken");
        Cookies.remove("azionRefreshToken");
      }
    })
    .catch(function (error: any) {
      if (error.response) {
        const message = error.response.data.message;

        if (message === "sessionCheck failed") {
          Cookies.remove("azionAccessToken");
          Cookies.remove("azionRefreshToken");
        } else {
          Cookies.remove("azionAccessToken");
          Cookies.remove("azionRefreshToken");
        }
      } else {
        console.log("An error occurred, but no server response was received.");
      }
    });
};

export default function FastLogIn() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [imageSrc, setImageSrc] = useState("");
  const [altText, setAltText] = useState("");

  useEffect(() => {
    sessionCheck();
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
            sessionCheck();
          }
        } catch (error) {
          console.error("Error sending image to API: ", error);
        }
      }
    }
  };
  return (
    <div className=" w-screen h-screen flex flex-col justify-center items-center gap-16 bg-background">
      <video
        className="rounded-full custom-oval"
        ref={videoRef}
        autoPlay
      ></video>
      <h1
        className={` text-white mb-5 text-5xl md:text-6xl lg:text-8xl ${azionText.className}`}
      >
        Azion<span className="text-neonAccent">Cam</span>.
      </h1>
      <button
        className="text-white bg-lightAccent w-fit font-black text-2xl px-56 py-3 rounded-3xl hover:scale-105 transition-all ease-in"
        onClick={captureAndSendFrame}
      >
        Login
      </button>
    </div>
  );
}
