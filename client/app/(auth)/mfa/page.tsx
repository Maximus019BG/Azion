"use client";
import {useEffect, useState} from "react";
import axios, {AxiosResponse} from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import OTP from "../../components/OTP";
import {apiUrl} from "../../api/config";
import {mfaSessionCheck} from "../../func/funcs";
import Loading from "../../components/Loading";

const VerifyMFAAxios = (data: any) => {
    axios
        .post(`${apiUrl}/mfa/verify-qr`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(function (response: AxiosResponse) {
            Cookies.set("mfaChecked" + response.data.email, "true", {
                secure: true,
                sameSite: "Strict",
            });
            window.location.href = "/account";
        })
        .catch(function (error: any) {
            console.log(error.response ? error.response : error);
        });
};

const verifyMFA = async (otp: string) => {
    const userData = {
        OTP: otp,
        accessToken: Cookies.get("azionAccessToken"),
    };
    if (!Cookies.get("azionAccessToken")) {
        console.log("Access Token is missing");
        return;
    } else if (otp.length !== 6) {
        console.log("OTP is invalid");
        return;
    } else {
        VerifyMFAAxios(userData);
    }
};

const MfaSetupPage = () => {
    const [qrCodeUri, setQrCodeUri] = useState("");
    const [mfaCode, setMfaCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");
        if (refreshToken && accessToken) {
            mfaSessionCheck(false);
        } else {
            window.location.href = "/login";
        }

        const fetchQrCodeUri = async (accessToken: string | undefined) => {
            if (!accessToken) {
                setError("Access Token is missing");
                setLoading(false);
                return;
            }
            const url = `${apiUrl}/mfa/qr-code?accessToken=${encodeURIComponent(accessToken)}`;
            try {
                const response = await axios.get(url, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                setQrCodeUri(response.data.qrCodeUri);
                fetchMFACode(accessToken);
            } catch (err) {
                setError("Failed to fetch QR code URI");
                setLoading(false);
            }
        };

        const fetchMFACode = async (accessToken: string | undefined) => {
            if (!accessToken) {
                setError("Access Token is missing");
                setLoading(false);
                return;
            }
            const url = `${apiUrl}/mfa/mfa-code?accessToken=${encodeURIComponent(accessToken)}`;
            try {
                const response = await axios.get(url, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                setMfaCode(response.data.mfaCode);
                setTimeout(() => {
                    setLoading(false);
                }, 1000); // 1 second
            } catch (err) {
                setError("Failed to fetch MFA code");
                setLoading(false);
            }
        };

        fetchQrCodeUri(accessToken);
    }, []);

    if (loading) return <Loading/>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="h-dvh w-full flex flex-col justify-center items-center text-gray-400 px-4 overflow-x-hidden">
            <h1 className="text-4xl md:text-5xl font-black tracking-wide mt-16 text-lightAccent">MFA</h1>
            <ul className="text-center space-y-2 md:space-y-0">
                <li>Scan the QR code below with your authenticator app (google authenticator / microsoft authenticator)</li>
                <li>If you don&apos;t have an authenticator app, you can download one from the app store.</li>
            </ul>
            <div className="flex justify-center my-4">
                <Image src={qrCodeUri} alt="QR Code" width={250} height={250} className="rounded-md"/>
            </div>
            <h2 className="text-3xl font-black text-lightAccent">Or</h2>
            <div className="text-center">
                <p className="text-lg">Enter the code below</p>
                <p className="font-bold">{mfaCode}</p>
            </div>
            <div className="flex flex-col justify-center items-center gap-2 mt-4">
                <div className="h-1 w-56 bg-gray-400 rounded-3xl"/>
                <h2 className="text-3xl font-black text-lightAccent">Then</h2>
                <p className="mb-3">Enter the One Time Password.</p>
            </div>
            <OTP length={6} onComplete={verifyMFA}/>
            <div className="w-full flex flex-col justify-center items-center mt-10">
                <p className="text-center">
                    &bull; <span className="font-black text-lightAccent uppercase">DO NOT REMOVE</span> THE AZION
                    FIELD FROM YOUR AUTHENTICATOR APP BECAUSE YOU WON&apos;T BE ABLE TO LOG BACK IN &bull;
                </p>
            </div>
        </div>
    );
};

export default MfaSetupPage;