import React, {useEffect, useState} from "react";
import Draggable from "react-draggable";
import ProfilePicture from "../components/Profile-picture";
import {Commissioner} from "next/font/google";
import {UserData} from "@/app/func/funcs";
import axios from "axios";
import Cookies from "js-cookie";
import {apiUrl} from "@/app/api/config";
import Image from "next/image";
import {FaPencilAlt} from "react-icons/fa";

const azionText = Commissioner({subsets: ["latin"], weight: "800"});

const Badge = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [roleLevel, setRoleLevel] = useState(0);
    const [isEditing, setIsEditing] = useState({name: false, email: false, dateOfBirth: false});
    const [prevValues, setPrevValues] = useState({name: "", email: "", dateOfBirth: ""});
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [displayImage, setDisplayImage] = useState<string | null>(null);
    const [isImageChanged, setIsImageChanged] = useState(false);

    const [position, setPosition] = useState({x: 0, y: 0});

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

    const handleDragStop = () => {
        setPosition({x: 0, y: 0});
    };

    return (
        <Draggable
            position={position}
            onStop={handleDragStop}
            onDrag={(e, data) => setPosition({x: data.x, y: data.y})}
        >
            <div
                className="relative bg-blue-600 w-[25vw] h-[70vh] rounded-xl flex flex-col justify-between p-8 text-white shadow-lg cursor-grab transform transition-transform hover:scale-105 hover:shadow-2xl">
                {/* Header */}
                <div className="relative z-10 ">
                    <div className="flex justify-between items-center ">
                        <div className="text-xl font-bold flex justify-center items-center">
                            <h1
                                className={` flex justify-center items-end gap-3 neon-text text-xl md:text-2xl lg:text-4xl ${azionText.className}`}
                            >
                                AZION
                                <span className="border border-white text-white text-xs p-1 rounded">
                  RL-{roleLevel}
                </span>
                            </h1>
                        </div>
                        <div className="text-3xl font-bold flex justify-center items-center">
                            <Image src="/white-logo.png" alt="white-logo-azion" width={70} height={50}></Image>
                        </div>
                    </div>
                </div>

                <div className="w-fit">
                    <ProfilePicture displayImage={displayImage} onFileChange={(file) => {
                        setProfilePicture(file);
                        setIsImageChanged(true);
                    }}/>
                </div>

                {/* Name Section */}
                <div className="relative z-10 w-fit">
                    {isEditing.name ? (
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 bg-transparent focus:outline-none text-white border-b border-white border-opacity-50"
                            />
                            <FaPencilAlt className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white"/>
                        </div>
                    ) : (
                        <h2 className="text-3xl font-bold"
                            onDoubleClick={() => setIsEditing({...isEditing, name: true})}>
                            {prevValues.name}
                        </h2>
                    )}
                    {isEditing.email ? (
                        <div className="relative w-full">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-transparent focus:outline-none text-white border-b border-white border-opacity-50"
                            />
                            <FaPencilAlt className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white"/>
                        </div>
                    ) : (
                        <h2 className="text-xl font-semibold"
                            onDoubleClick={() => setIsEditing({...isEditing, email: true})}>
                            {prevValues.email}
                        </h2>
                    )}
                    <p className="text-sm mt-2 uppercase">{role}</p>
                </div>

                {/* Date and Event Type */}
                <div className="relative z-10">
                    <div className="uppercase text-sm">
                        <div className="relative z-10 w-fit">
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
                </div>
                {/* Save Button */}
                {(isEditing.name || isEditing.email || isEditing.dateOfBirth || isImageChanged) && (
                    <button
                        onClick={handleSubmit}
                        className="bg-gray-800 text-white hover:bg-gray-700 font-bold py-2 px-4 rounded"
                    >
                        Save
                    </button>
                )}
            </div>
        </Draggable>
    );
};

export default Badge;