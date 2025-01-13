import React, {useEffect, useState} from "react";
import ProfilePicture from "../components/Profile-picture";
import {Commissioner} from "next/font/google";
import {UserData} from "../func/funcs";
import axios from "axios";
import Cookies from "js-cookie";
import {apiUrl} from "@/app/api/config";
import {FaPencilAlt} from "react-icons/fa";

const azionText = Commissioner({subsets: ["latin"], weight: "800"});

export const UserInfo = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [roleLevel, setRoleLevel] = useState(0);
    const [isEditing, setIsEditing] = useState({name: false, email: false, dateOfBirth: false});
    const [prevValues, setPrevValues] = useState({name: "", email: "", dateOfBirth: ""});
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [displayImage, setDisplayImage] = useState<string | null>(null);
    const [isImageChanged, setIsImageChanged] = useState<boolean>(false);

    useEffect(() => {
        UserData().then((response) => {
            setName(response.name);
            setEmail(response.email);
            setRole(response.role);
            setRoleLevel(response.roleLevel);
            setDateOfBirth(response.age.substring(0, 10));
            setPrevValues({name: response.name, email: response.email, dateOfBirth: response.age.substring(0, 10)});
            setDisplayImage(response.profilePicture);
        });
    }, []);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const token = Cookies.get("azionAccessToken");

        const formData = new FormData();
        formData.append("accessToken", token || "");
        formData.append("name", name);
        formData.append("email", email);
        formData.append("dateOfBirth", dateOfBirth);
        if (profilePicture) {
            formData.append("file", profilePicture);
        }

        try {
            const response = await axios.put(`${apiUrl}/user/update`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                alert("User updated successfully");
                setIsEditing({name: false, email: false, dateOfBirth: false});
                setPrevValues({name, email, dateOfBirth});
                setIsImageChanged(false);
            } else {
                alert("Failed to update user");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user");
        }
    };

    return (
        <>
            <div
                className="relative bg-base-300 w-full h-fit rounded-xl flex flex-col justify-between p-8 text-white shadow-lg">
                <div className="w-full flex justify-evenly items-center">
                    <ProfilePicture displayImage={displayImage} onFileChange={(file) => {
                        setProfilePicture(file);
                        setIsImageChanged(true);
                    }}/>
                    <div className="flex flex-col justify-center items-center">
                        {isEditing.name ? (
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 bg-transparent focus:outline-none text-white border-b border-white border-opacity-50"
                                />
                                <FaPencilAlt
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white"/>
                            </div>
                        ) : (
                            <h2 className="text-3xl font-bold"
                                onDoubleClick={() => setIsEditing({...isEditing, name: true})}>
                                {prevValues.name}
                            </h2>
                        )}
                        <p className="text-sm mt-2 bg-accent p-2 rounded-full uppercase">{role}</p>
                    </div>
                    <div>
                        {isEditing.email ? (
                            <div className="relative w-full">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 bg-transparent focus:outline-none text-white border-b border-white border-opacity-50"
                                />
                                <FaPencilAlt
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white"/>
                            </div>
                        ) : (
                            <h2 className="text-xl font-semibold"
                                onDoubleClick={() => setIsEditing({...isEditing, email: true})}>
                                {prevValues.email}
                            </h2>
                        )}

                        {isEditing.dateOfBirth ? (
                            <div className="relative w-full">
                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    className="w-full px-3 py-2 bg-transparent focus:outline-none text-white border-b border-white border-opacity-50"
                                />
                                <FaPencilAlt
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white"/>
                            </div>
                        ) : (
                            <p className="uppercase text-sm"
                               onDoubleClick={() => setIsEditing({...isEditing, dateOfBirth: true})}>
                                {prevValues.dateOfBirth}
                            </p>
                        )}
                    </div>
                </div>
                {(isEditing.name || isEditing.email || isEditing.dateOfBirth || isImageChanged) && (
                    <button
                        onClick={handleSubmit}
                        className="bg-gray-800 text-white hover:bg-gray-700 font-bold py-2 px-4 rounded"
                    >
                        Save
                    </button>
                )}
            </div>
        </>
    );
};