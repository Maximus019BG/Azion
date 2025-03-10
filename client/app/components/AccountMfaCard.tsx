import React, {useEffect, useState} from 'react';
import {UserData} from "../func/funcs";
import OTP from "@/app/components/OTP";
import {MfaButtons} from "../components/MfaButtons";
import Link from "next/link";
import {apiUrl} from "@/app/api/config";
import axios, {AxiosResponse} from "axios";
import Cookies from "js-cookie";

const AccountMfaCard = () => {
    const [isMfaEnabled, setIsMfaEnabled] = useState<boolean>(false);
    const [isFaceIdEnabled, setIsFaceIdEnabled] = useState<boolean>(true);
    const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [otpValue, setOtpValue] = useState<string>("");

    useEffect(() => {
        // Get the user data
        UserData().then((response) => {
            setIsMfaEnabled(response.mfaEnabled);
            setIsFaceIdEnabled(response.faceIdEnabled);
        });
    }, []);

    // Handles OTP completion
    const handleOtpComplete = (otp: string) => {
        setOtpValue(otp);
        console.log("OTP entered:", otp);
        setShowOtpModal(false); // Close OTP modal after completion
    };

    // Disable FaceID action
    const handleDisableFaceId = () => {
        setShowConfirmModal(true);
    };

    const RemFaceID = () => {
        const data = {
            accessToken: Cookies.get("azionAccessToken")
        }
        axios
            .put(`${apiUrl}/mfa/rem/face`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then(function (response: AxiosResponse) {
                Cookies.set("mfaChecked" + response.data.email, "true", {
                    secure: true,
                    sameSite: "Strict",
                });
                setIsFaceIdEnabled(false); // Update state to disable FaceID
            })
            .catch(function (error: any) {
                console.log(error.response ? error.response : error);
            });
    }

    return (
        <div
            className="w-full max-w-3xl mx-auto border-2 border-base-100 bg-base-300 rounded-lg shadow-md overflow-hidden">
            {/* MAIN SECTION */}
            <div className="p-6 border-b-2 border-base-100 flex flex-col justify-between items-start gap-3">
                <h1 className="text-2xl font-bold text-white">Security & Privacy</h1>
                <p className="text-gray-300 py-3 text-sm">
                    Manage your account security by accessing your active sessions or enabling two-factor authentication
                    (2FA) for enhanced protection.
                </p>
            </div>
            {/* END MAIN SECTION */}
            <div className="bg-base-300">
                <div className="w-full flex justify-center items-center gap-6 p-4">
                    <MfaButtons isMfaEnabled={isMfaEnabled}/>
                    <div className="w-full">
                        <button
                            onClick={handleDisableFaceId} // Handle FaceID disable click
                            className="bg-gray-800 w-full text-white transition duration-200 ease-in-out hover:bg-gray-700 font-bold py-2 px-4 rounded"
                        >
                            Disable FaceID
                        </button>
                    </div>
                    <Link href="/account/sessions" className="w-full">
                        <button
                            className="bg-accent w-full text-white transition duration-200 ease-in-out hover:bg-blue-500 font-bold py-2 px-4 rounded"
                        >
                            View Sessions
                        </button>
                    </Link>
                </div>
            </div>

            {/* OTP Modal (For MFA-enabled users) */}
            {showOtpModal && isMfaEnabled && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4 text-gray-200">Enter OTP to Disable FaceID</h2>
                        <OTP length={6} onComplete={handleOtpComplete}/>
                        <div className="flex justify-end gap-4 mt-4">
                            <button
                                onClick={() => setShowOtpModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    RemFaceID();
                                    setShowConfirmModal(false); // Close modal after action
                                }}
                                className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Modal (For non-MFA users) */}
            {showConfirmModal && !isMfaEnabled && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4 text-gray-200">Confirm Disabling FaceID</h2>
                        <p className="text-sm text-gray-200 mb-4">
                            Are you sure you want to disable FaceID for your account? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    RemFaceID();
                                    setShowConfirmModal(false); // Close modal after action
                                }}
                                className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountMfaCard;
