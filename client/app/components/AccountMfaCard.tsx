import React, {useEffect, useState} from 'react';
import {UserData} from "../func/funcs";
import {MfaButtons} from "../components/MfaButtons";
import Link from "next/link";

const AccountMfaCard = () => {
    const[isMfaEnabled, setIsMfaEnabled] = useState<boolean>(false);

    useEffect(() => {
        UserData().then((response) => {
            setIsMfaEnabled(response.mfaEnabled);
        });
    }, []);

    return (
        <div
            className="w-full max-w-3xl mx-auto border-2 border-base-100 bg-base-300 rounded-lg shadow-md overflow-hidden">
            {/* MAIN SECTION */}
            <div className="p-6 border-b-2 border-base-100 flex flex-col justify-between items-start gap-3">
                <h1 className=" text-2xl font-bold text-white">Security & Privacy</h1>
                <p className="text-gray-300 py-3 text-sm">Manage your account security by accessing your active
                    sessions
                    or
                    enabling
                    two-factor authentication (2FA) for enhanced protection.</p>
            </div>
            {/* END MAIN SECTION */}
            <div className="bg-base-300">
                <div className="w-full flex justify-center items-center gap-6 p-4">
                    <MfaButtons isMfaEnabled={isMfaEnabled}/>
                    <Link href="/mfa/face" className="w-full">
                        <button
                            className="bg-gray-800 w-full text-white transition duration-200 ease-in-out hover:bg-gray-700 font-bold py-2 px-4 rounded">
                            FaceID
                        </button>
                    </Link>
                    <Link href="/account/sessions" className="w-full">
                        <button
                            className="bg-accent w-full text-white transition duration-200 ease-in-out hover:bg-blue-500 font-bold py-2 px-4 rounded">
                            Session
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AccountMfaCard;