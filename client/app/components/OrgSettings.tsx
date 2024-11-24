"use client";
import React, {useEffect, useState} from "react";
import axios, {AxiosResponse} from "axios";
import Cookies from "js-cookie";
import {apiUrl} from "@/app/api/config";
import {OrgConnString} from "@/app/func/org";
import {CheckMFA, PartOfOrg, UserData} from "@/app/func/funcs";

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
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

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
    };

    const handleSave = async () => {
        try {
            await axios.put(
                `${apiUrl}/org/update/${Cookies.get("azionAccessToken")}`,
                orgData,
                {
                    headers: {"Content-Type": "application/json"},
                }
            );
            setAlertMessage("Organization details updated successfully");
        } catch (error) {
            console.error(error);
            setAlertMessage("Failed to update organization details");
        }
    };

    const [loading, setLoading] = useState<boolean>(true);
    const [conString, setConString] = useState<string>("");

    CheckMFA(false);
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

    return (
        <div className="w-full max-w-4xl mx-auto bg-base-300 shadow-xl rounded-xl p-6 sm:p-12 flex flex-col gap-8">
            <h2 className="text-3xl font-semibold text-white text-center">
                Organization Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {["orgName", "orgAddress", "orgEmail", "orgType", "orgPhone"].map(
                    (field, index) => (
                        <div className="flex flex-col" key={index}>
                            <label className="text-sm font-medium text-gray-300 capitalize">
                                {field.replace("org", "").replace(/([A-Z])/g, " $1")}:
                            </label>
                            <input
                                name={field}
                                type={field === "orgEmail" ? "email" : "text"}
                                value={orgData[field]}
                                onChange={handleInputChange}
                                className="p-2 bg-base-100 text-white rounded-lg w-full transition duration-200 ease-in-out"
                            />
                        </div>
                    )
                )}

                <div className="col-span-1 sm:col-span-2 md:col-span-3 flex flex-col">
                    <label className="text-sm font-medium text-gray-300">Description:</label>
                    <textarea
                        name="orgDescription"
                        value={orgData.orgDescription}
                        onChange={handleInputChange}
                        className="p-4 bg-base-100 text-white border-2 border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-lg w-full resize-none transition duration-200 ease-in-out"
                        rows={4}
                    />
                </div>
            </div>

            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={handleSave}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition duration-200 ease-in-out"
                >
                    Save Changes
                </button>

                <h2 className="text-lg text-gray-300 text-center">
                    Connection Code: <span className="font-semibold">{conString}</span>
                </h2>

                {alertMessage && (
                    <div className="mt-4 text-white bg-red-500 p-3 rounded-md shadow-md">
                        {alertMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrgSettingsForm;
