"use client";
import React, { useEffect, useState } from "react";
import { UserData } from "../func/funcs";
import Cookies from "js-cookie";
import axios from "axios";
import { apiUrl } from "@/app/api/config";
import OTP from "@/app/components/OTP";

const AccountDeleteCard = () => {
    const [isMfaEnabled, setIsMfaEnabled] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [otpValue, setOtpValue] = useState<string>("");

    useEffect(() => {
        UserData().then((response) => {
            setIsMfaEnabled(response.mfaEnabled);
        });
    }, []);

    const deleteAccount = () => {
        const token = Cookies.get("azionAccessToken");

        axios
            .delete(`${apiUrl}/user/user/delete`, {
                headers: {
                    "Content-Type": "application/json",
                    authorization: token,
                    OTP: isMfaEnabled ? otpValue : " ",
                },
            })
            .then((r) => {
                console.log(r);
                setShowModal(false);
                window.location.reload();
            })
            .catch((e) => {
                console.error(e);
            });
    };

    return (
        <div
            className="w-full max-w-3xl mx-auto border-2 border-red-500 border-opacity-55 bg-base-300 rounded-lg shadow-md overflow-hidden">
            {/* MAIN SECTION */}
            <div
                className="p-6 border-b-2 border-red-500 border-opacity-55 flex flex-col justify-between items-start gap-3">
                <h1 className=" text-2xl font-bold text-white">Delete Account</h1>
                <p className="text-gray-300 py-3 text-sm">Permanently delete your account. Keep in mind that this
                    action
                    cannot be undone and will result in the complete removal of all your data from Azion.</p>
            </div>
            {/* END MAIN SECTION */}
            <div className="bg-red-900 bg-opacity-45">
                <div className="w-full flex justify-center items-center gap-6 p-4">
                    <div className="w-full flex justify-end">
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-red-700 text-sm w-36 text-white transition duration-200 ease-in-out opacity-100 hover:bg-red-600 font-bold py-2 px-4 rounded"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4 text-gray-200">Confirm Deletion</h2>
                        {isMfaEnabled ? (
                            <div>
                                <p className="text-sm text-gray-200 mb-4">
                                    Enter the OTP sent to your registered device to confirm account deletion.
                                </p>
                                <OTP length={6} onComplete={(value:string) => setOtpValue(value)} />
                            </div>
                        ) : (
                            <p className="text-sm text-gray-200 mb-4">
                                Are you sure you want to permanently delete your account? This action cannot be undone.
                            </p>
                        )}
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteAccount}
                                className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                                disabled={isMfaEnabled && !otpValue} // Disable button if OTP is empty and MFA is enabled
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

export default AccountDeleteCard;
