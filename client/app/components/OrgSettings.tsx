"use client";
import React, {useEffect, useState} from "react";
import axios, {AxiosResponse} from "axios";
import Cookies from "js-cookie";
import {apiUrl, clientUrl} from "@/app/api/config";
import {OrgConnString} from "@/app/func/org";
import {PartOfOrg, UserData} from "@/app/func/funcs";
import {PeopleData} from "@/app/types/types";
import {IoBusiness, IoCall, IoCopy, IoInformationCircle, IoLocation, IoMail, IoPerson} from "react-icons/io5";

const SessionCheck = () => {
    const refreshToken = Cookies.get("azionRefreshToken");
    const accessToken = Cookies.get("azionAccessToken");

    const data = {refreshToken, accessToken};

    const url = `${apiUrl}/token/session/check`;
    axios
        .post(url, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((response: AxiosResponse) => {
            const {message, accessToken} = response.data;
            if (message === "newAccessToken generated") {
                Cookies.set("azionAccessToken", accessToken, {
                    secure: true,
                    sameSite: "Strict",
                });
            }
        })
        .catch((error) => {
            console.error(error.response ? error.response : error);
            Cookies.remove("azionAccessToken");
            Cookies.remove("azionRefreshToken");
            window.location.href = "/login";
        });
};

const OrgSettingsForm = () => {
    const [orgData, setOrgData] = useState<{
        [key: string]: string;
    }>({
        orgName: "",
        orgAddress: "",
        orgEmail: "",
        orgType: "",
        orgPhone: "",
        orgDescription: "",
    });
    const [invitePopUp, setInvitePopUp] = useState<boolean>(false);
    const [people, setPeople] = useState<PeopleData>({});
    const [madeChange, setMadeChange] = useState(false);

    useEffect(() => {
        const fetchOrgData = async () => {
            try {
                const response: AxiosResponse = await axios.get(
                    `${apiUrl}/org/${Cookies.get("azionAccessToken")}`,
                    {
                        headers: {"Content-Type": "application/json"},
                    }
                );
                setOrgData({
                    orgName: response.data.orgName,
                    orgAddress: response.data.orgAddress,
                    orgEmail: response.data.orgEmail,
                    orgType: response.data.orgType,
                    orgPhone: response.data.orgPhone,
                    orgDescription: response.data.orgDescription,
                });
            } catch (error) {
                console.error(error);
            }
        };

        fetchOrgData();
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const {name, value} = e.target;
        setOrgData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setMadeChange(true);
    };

    const handleInviteChange = () => {
        setInvitePopUp(!invitePopUp);
    };

    const handleSave = async () => {
        if (orgData["orgName"].includes(" ")) {
            alert("Organization name can't contain spaces");
        } else {
            try {
                await axios.put(
                    `${apiUrl}/org/update/${Cookies.get("azionAccessToken")}`,
                    orgData,
                    {
                        headers: {"Content-Type": "application/json"},
                    }
                );
                setMadeChange(false);
                alert("Organization details updated successfully");
            } catch (error) {
                console.error(error);
                alert("Failed to update organization details");
            }
        }
    };

    const [loading, setLoading] = useState<boolean>(true);
    const [conString, setConString] = useState<string>("");
    PartOfOrg(true);

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");

        if (refreshToken && accessToken) {
            PartOfOrg(true).then();
            SessionCheck();
            setTimeout(() => {
                UserData().then(() => {
                    setLoading(false);
                });
            }, 1000);
        } else if (!accessToken && !refreshToken) {
            window.location.href = "/login";
        }
    }, []);

    useEffect(() => {
        OrgConnString()
            .then((data: string) => {
                setConString(data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    useEffect(() => {
        const accessToken = Cookies.get("azionAccessToken");

        const getPeople = async () => {
            try {
                const response: AxiosResponse = await axios.get(`${apiUrl}/org/get/invites`, {
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": accessToken,
                    }
                });

                setPeople(response.data);
            } catch (e) {
                console.error(e);
            }
        };

        getPeople();
    }, []);

    const copyLink = () => {
        navigator.clipboard.writeText(`${clientUrl}/organizations/${conString}`);
    };

    const copyConStr = () => {
        navigator.clipboard.writeText(conString);
        alert("Connection code copied to clipboard");
    };

    const inviteUser = async (id: string) => {
        const accessToken: string | undefined = Cookies.get("azionAccessToken");
        const link = `${clientUrl}/organizations/${conString}`;
        try {
            await axios.put(`${apiUrl}/org/invite/${id}`, {}, {
                headers: {
                    "Content-Type": "application/json",
                    "authorization": accessToken,
                    "data": link,
                }
            });
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="w-full h-dvh">
            <div>
                <h2 className="text-3xl sm:text-4xl font-semibold text-white p-8 md:p-16">
                    Organization Settings
                </h2>
            </div>

            <div className="w-full h-full flex flex-col justify-start gap-8">
                <div className="flex flex-col justify-center items-center gap-10">
                    <div
                        className="w-full h-full max-w-3xl mx-auto border-2 border-blue-900/30 bg-gradient-to-b from-blue-900/10 to-transparent rounded-lg shadow-md overflow-hidden">
                        <div
                            className="px-8 py-10 border-b-2 border-base-100 flex justify-evenly items-center gap-6 sm:gap-0">
                            <div className="w-full h-full flex flex-col justify-evenly items-start gap-10">
                                {[
                                    {name: "orgName", icon: <IoPerson/>},
                                    {name: "orgEmail", icon: <IoMail/>},
                                    {name: "orgPhone", icon: <IoCall/>}
                                ].map((field, index) => (
                                    <div className="w-full flex justify-evenly items-center group" key={index}>
                                        <label
                                            className="text-base font-medium text-gray-100 capitalize flex items-center gap-2">
                                            {field.icon}
                                            {field.name.replace("org", "").replace(/([A-Z])/g, " $1")}
                                        </label>
                                        <input
                                            name={field.name}
                                            type={field.name === "orgEmail" ? "email" : "text"}
                                            value={orgData[field.name]}
                                            onChange={handleInputChange}
                                            className="text-base mx-4 w-full gap-3 font-bold text-white bg-transparent border-b border-accent focus:outline-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div
                            className="px-8 py-10 border-b-2 border-blue-900/30 flex justify-evenly items-center gap-6 sm:gap-0">
                            <div className="w-full h-full flex flex-col justify-evenly items-start gap-10">
                                {[
                                    {name: "orgType", icon: <IoBusiness/>},
                                    {name: "orgAddress", icon: <IoLocation/>}
                                ].map((field, index) => (
                                    <div className="flex items-center group w-full" key={index}>
                                        <label
                                            className="text-base font-medium text-gray-100 capitalize flex items-center gap-2">
                                            {field.icon}
                                            {field.name.replace("org", "").replace(/([A-Z])/g, " $1")}
                                        </label>
                                        <input
                                            name={field.name}
                                            type="text"
                                            value={orgData[field.name]}
                                            onChange={handleInputChange}
                                            className="text-base mx-4 w-full gap-3 font-bold text-white bg-transparent border-b border-accent focus:outline-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 p-4 ">
                            <label className="text-base text-gray-100 font-medium flex items-center gap-2 ">
                                <IoInformationCircle/>
                                Description
                            </label>
                            <textarea
                                name="orgDescription"
                                value={orgData.orgDescription}
                                onChange={handleInputChange}
                                className="p-4 text-sm border-2 border-blue-900/30 bg-gradient-to-b from-blue-900/10 to-transparent text-gray-200 rounded-md resize-none"
                                rows={4}
                            />
                        </div>
                    </div>
                    <div className="w-full h-fit flex flex-col items-center gap-4 sm:gap-6 md:gap-8">
                        {madeChange && (
                            <div className="w-full h-full max-w-3xl mx-auto">
                                <button
                                    onClick={handleSave}
                                    className="w-full py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition duration-200 ease-in-out"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}

                        <div className="w-full h-full max-w-3xl mx-auto">
                            <button
                                onClick={handleInviteChange}
                                className="w-full py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition duration-200 ease-in-out"
                            >
                                Invite
                            </button>

                            <p className="flex justify-center items-center mt-4 gap-2">
                                Or join with connection code: {conString}
                                <span className="cursor-pointer" onClick={copyConStr}>
                                    <IoCopy/>
                                </span>
                            </p>
                        </div>

                        {invitePopUp && (
                            <div
                                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
                                <div
                                    className="bg-accent p-6 rounded-lg shadow-lg w-80 sm:w-96 relative transform transition-transform duration-300 scale-95">
                                    <button
                                        onClick={handleInviteChange}
                                        className="absolute top-2 right-2 text-xl font-bold text-gray-300 hover:text-gray-100 transition-colors duration-200"
                                    >
                                        &times;
                                    </button>

                                    <h3 className="text-xl font-semibold mb-4 text-white">Invite people:</h3>
                                    {Object.keys(people).length > 0 ? (
                                        <ul className="space-y-2">
                                            {Object.entries(people).map(([email, id]) => (
                                                <li
                                                    key={id}
                                                    className="flex justify-between cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors duration-200"
                                                    onClick={() => inviteUser(id)}
                                                >
                                                    <h1 className="text-white">{email}</h1>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-400">Nobody to invite</p>
                                    )}
                                    <div className="mt-10">
                                        <h1 className="text-white flex gap-2">
                                            Or copy
                                            <button
                                                onClick={copyLink}
                                                className="underline text-white hover:text-slate-400 transition-colors duration-200"
                                            >
                                                link
                                            </button>
                                        </h1>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrgSettingsForm;