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
            if (Cookies.get("OrgOwner") === "true") {
                window.location.href = "/register/organization";
            } else {
                window.location.href = "/organizations";
            }
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
            mfaSessionCheck();
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
        <div className="h-screen w-screen text-gray-400">
            <div className="flex flex-col justify-center items-center gap-5">
                <h1 className="text-5xl font-black tracking-wide mt-16 text-lightAccent">MFA</h1>
                <ul className="text-center">
                    <li>Azion requires you to have Multi Factor Authentication (MFA). Without MFA your organization data
                        is not secure.
                    </li>
                    <li>Scan the QR code below with your authenticator app.</li>
                    <li>If you don&apos;t have an authenticator app, you can download one from the app store.</li>
                </ul>
                <Image src={qrCodeUri} alt="QR Code" width={300} height={300} className="rounded-md"/>
                <h2 className="text-3xl font-black text-lightAccent">Or</h2>
                <div className="text-center">
                    <p className="text-lg">Enter the code below</p>
                    <p className="font-bold">{mfaCode}</p>
                </div>
            </div>
            <div className="">
                <div className="flex flex-col justify-center items-center gap-2">
                    <div className="h-1 w-56 bg-gray-400 rounded-3xl mt-4"/>
                    <h2 className="text-3xl font-black text-lightAccent">Then</h2>
                    <p className="mb-3">Enter the One Time Password.</p>
                </div>
                <OTP length={6} onComplete={verifyMFA}/>
                <div className="flex flex-col justify-center items-center">
                    <p className="mt-10">
                        &bull; <span className="font-black text-lightAccent uppercase">DO NOT REMOVE</span> THE AZION
                        FIELD FROM YOUR AUTHENTICATOR APP BECAUSE YOU WON&apos;T BE ABLE TO LOG BACK IN &bull;
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MfaSetupPage;