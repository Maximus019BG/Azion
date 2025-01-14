import React, {useEffect, useState} from 'react';
import {UserData} from "../func/funcs";
import Link from "next/link";

const AccountMfaCard = () => {
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [displayImage, setDisplayImage] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [isEditing, setIsEditing] = useState({name: false, email: false, dateOfBirth: false});

    useEffect(() => {
        UserData().then((response) => {
            setDisplayImage(response.profilePicture);
            setName(response.name);
            setEmail(response.email);
            setRole(response.role);
            setDateOfBirth(response.age.substring(0, 10));
        });
    }, []);

    const handleSave = () => {
        // Add logic to save the updated information
        setIsEditing({name: false, email: false, dateOfBirth: false});
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
                    <Link href="/account/sessions" className="w-full flex justify-end">
                        <button
                            className="bg-red-700 text-sm w-36 text-white transition duration-200 ease-in-out opacity-100 hover:bg-red-600 font-bold py-2 px-4 rounded">
                            Delete
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AccountMfaCard;