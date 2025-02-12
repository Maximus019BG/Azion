import React, {useEffect, useState} from "react";
import {Employee} from "@/app/types/types";
import Image, {StaticImageData} from "next/image";
import Default from "@/public/user.png";
import {IoCopy} from "react-icons/io5";
import {byteArrayToBase64} from "@/app/func/funcs";
import axios from "axios";
import {apiUrl} from "@/app/api/config";
import Cookies from "js-cookie";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";

const DisplayEmployee: React.FC<Employee> = ({
                                                 id,
                                                 name,
                                                 email,
                                                 age,
                                                 role,
                                                 orgid,
                                                 roleLevel,
                                                 profilePicture,
                                             }) => {
    const [isEmailVisible, setIsEmailVisible] = useState(false);
    const [isAgeVisible, setIsAgeVisible] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [imageSrc, setImageSrc] = useState<string | StaticImageData>(Default);

    useEffect(() => {
        if (profilePicture && profilePicture !== "null") {
            const byteArray = profilePicture
                .substring(1, profilePicture.length - 1)
                .split(", ")
                .map(Number);
            byteArrayToBase64(byteArray).then((base64String) => {
                if (base64String === null) return;

                setImageSrc(base64String);
            });
        } else {
            setImageSrc(Default);
        }
    }, [profilePicture]);

    useEffect(() => {
        if (isCollapsed) {
            setIsEmailVisible(false);
            setIsAgeVisible(false);
        }
    }, [isCollapsed]);

    const handleCollapseChange = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const removeEmployee = () => {
        axios
            .delete(`${apiUrl}/org/remove/employee/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    authorization: Cookies.get("azionAccessToken"),
                },
            })
            .then(() => {
            })
            .catch((error) => {
                console.error("Error removing employee: ", error);
                alert("Error removing employee");
            });
    };

    return (
        <div className="w-11/12 mx-auto">
            <div className="bg-slate-900 collapse">
                <input
                    type="checkbox"
                    className="peer"
                    onChange={handleCollapseChange}
                />
                <div
                    className={`collapse-title bg-slate-800 text-white peer-checked:bg-[${role.color}] peer-checked:text-white flex flex-row sm:items-center`}
                >
                    <div className="avatar">
                        <div className="w-10 rounded-full">
                            <Image
                                src={imageSrc}
                                alt={`${name}'s profile picture`}
                                width={50}
                                height={50}
                                quality={100}
                            />
                        </div>
                    </div>
                    <h1 className="mt-2 sm:mt-0 ml-3 text-center sm:text-left">{name}</h1>
                </div>
                <div
                    className={`collapse-content bg-base-200 text-primary-content peer-checked:bg-[${role.color}] peer-checked:text-white flex flex-col sm:flex-row sm:justify-between sm:items-center`}
                >
                    <div className="w-full sm:w-1/2">
                        <p>
                            Access level: {roleLevel}, Role: {role.name}
                        </p>
                        <h2 className="font-bold mt-4">Sensitive information</h2>
                        <div className="mt-2">
                            <div className="flex items-center">
                                <p>Email: </p>
                                <div
                                    className={`${
                                        isEmailVisible ? "" : "blur-sm select-none"
                                    } ml-2`}
                                >
                                    <p>{email}</p>
                                </div>
                                <button
                                    onClick={() => setIsEmailVisible(!isEmailVisible)}
                                    className="ml-2"
                                >
                                    <FontAwesomeIcon
                                        icon={isEmailVisible ? faEyeSlash : faEye}
                                    />
                                </button>
                                <button
                                    onClick={() => handleCopy(email)}
                                    className="ml-2 text-sm"
                                >
                                    <IoCopy/>
                                </button>
                            </div>
                            <div className="flex items-center mt-2">
                                <p>Born in:</p>
                                <div
                                    className={`${
                                        isAgeVisible ? "" : "blur-sm select-none"
                                    } ml-2`}
                                >
                                    <p>{age.substring(0, 10)}</p>
                                </div>
                                <button
                                    onClick={() => setIsAgeVisible(!isAgeVisible)}
                                    className="ml-2"
                                >
                                    <FontAwesomeIcon
                                        icon={isAgeVisible ? faEyeSlash : faEye}
                                    />
                                </button>
                                <button
                                    onClick={() => handleCopy(age.substring(0, 10))}
                                    className="ml-2 text-sm"
                                >
                                    <IoCopy/>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div
                        className="w-full sm:w-1/2 flex flex-col justify-center items-start sm:items-end gap-5 mt-5 sm:mt-0">
                        <h2 className="max-w-sm text-right text-xs">
                            Do not share this with anyone except Azion support
                        </h2>
                        <div className="flex gap-7 justify-end">
                            <div className="flex items-center">
                                <p>Id</p>
                                <button
                                    onClick={() => handleCopy(id)}
                                    className="ml-2 text-sm"
                                >
                                    <IoCopy/>
                                </button>
                            </div>
                            <div className="flex items-center">
                                <p>Org Id</p>
                                <button
                                    onClick={() => handleCopy(orgid)}
                                    className="ml-2 text-sm"
                                >
                                    <IoCopy/>
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => removeEmployee()}
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
                        >
                            Remove user
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisplayEmployee;
