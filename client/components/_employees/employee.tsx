import React, {useEffect, useState} from "react";
import {Employee} from "@/app/types/types";
import Image, {StaticImageData} from "next/image";
import Default from "@/public/user.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";
import {IoCopy} from "react-icons/io5";
import {byteArrayToBase64} from "@/app/func/funcs";
import axios from "axios";
import {apiUrl} from "@/app/api/config";
import Cookies from "js-cookie";

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
    const [isIdVisible, setIsIdVisible] = useState(false);
    const [isOrgIdVisible, setIsOrgIdVisible] = useState(false);
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
            setIsIdVisible(false);
            setIsOrgIdVisible(false);
        }
    }, [isCollapsed]);

    const handleCollapseChange = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const removeEmployee = () => {
        axios.delete(`${apiUrl}/org/remove/employee/${id}`, {
            headers: {
                "Content-Type": "application/json",
                "authorization": Cookies.get("azionAccessToken")
            }
        })
    }

    return (
        <div className="w-full">
            <div className="bg-slate-900 collapse">
                <input
                    type="checkbox"
                    className="peer"
                    onChange={handleCollapseChange}
                />
                <div
                    className={
                        roleLevel === 1
                            ? `collapse-title bg-slate-800 text-white peer-checked:bg-accent peer-checked:text-white`
                            : `collapse-title bg-slate-800 text-white peer-checked:bg-lightAccent peer-checked:text-secondary-content`
                    }
                >
                    <div className="flex items-center">
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
                        <h1 className="ml-3">{name}</h1>
                    </div>
                </div>
                <div
                    className={
                        roleLevel === 1
                            ? `collapse-content bg-slate-800 text-primary-content peer-checked:bg-accent peer-checked:text-white`
                            : `collapse-content bg-accent text-primary-content peer-checked:bg-lightAccent peer-checked:text-secondary-content`
                    }
                >
                    <p>
                        Access level: {roleLevel}, Role: {role}
                    </p>
                    <div>
                        <h2>Sensitive information</h2>
                    </div>
                    <div className="flex gap-96">
                        <div>
                            <div className="flex items-center">
                                <p>Email: &nbsp;</p>
                                <div className={isEmailVisible ? "" : "blur-sm select-none"}>
                                    <p>{email}</p>
                                </div>
                                <button
                                    onClick={() => setIsEmailVisible(!isEmailVisible)}
                                    className="ml-2"
                                >
                                    <FontAwesomeIcon icon={isEmailVisible ? faEyeSlash : faEye}/>
                                </button>
                                <button onClick={() => handleCopy(email)} className="ml-2">
                                    <IoCopy/>
                                </button>
                            </div>
                            <div className="flex items-center">
                                <p>Born in: &nbsp;</p>
                                <div className={isAgeVisible ? "" : "blur-sm select-none"}>
                                    <p> {age.substring(0, 10)}</p>
                                </div>
                                <button
                                    onClick={() => setIsAgeVisible(!isAgeVisible)}
                                    className="ml-2"
                                >
                                    <FontAwesomeIcon icon={isAgeVisible ? faEyeSlash : faEye}/>
                                </button>
                                <button
                                    onClick={() => handleCopy(age.substring(0, 10))}
                                    className="ml-2"
                                >
                                    <IoCopy/>
                                </button>
                            </div>
                        </div>
                        <div className="absolute right-10 bottom-4">
                            <h2>Do not share this with anyone except azion support</h2>
                            <div className="flex gap-7 justify-end ">
                                <div className="flex items-center">
                                    <p>Id</p>
                                    <button onClick={() => handleCopy(id)} className="ml-2">
                                        <IoCopy/>
                                    </button>
                                </div>

                                <div className="flex items-center">
                                    <p>Org Id</p>
                                    <button onClick={() => handleCopy(orgid)} className="ml-2">
                                        <IoCopy/>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-1/2 right-5">
                            <button onClick={() => removeEmployee()}>Remove user</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisplayEmployee;