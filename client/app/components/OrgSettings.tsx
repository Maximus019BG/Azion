"use client"
import type React from "react"
import {useEffect, useState} from "react"
import axios, {type AxiosResponse} from "axios"
import Cookies from "js-cookie"
import {apiUrl, clientUrl} from "@/app/api/config"
import {OrgConnString} from "@/app/func/org"
import {PartOfOrg, UserData} from "@/app/func/funcs"
import type {PeopleData} from "@/app/types/types"
import {IoBusiness, IoCall, IoCopy, IoInformationCircle, IoLocation, IoMail, IoPerson} from "react-icons/io5"
import InviteModal from "@/app/components/InviteModal"

const SessionCheck = () => {
    const refreshToken = Cookies.get("azionRefreshToken")
    const accessToken = Cookies.get("azionAccessToken")

    const data = {refreshToken, accessToken}

    const url = `${apiUrl}/token/session/check`
    axios
        .post(url, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((response: AxiosResponse) => {
            const {message, accessToken} = response.data
            if (message === "newAccessToken generated") {
                Cookies.set("azionAccessToken", accessToken, {
                    secure: true,
                    sameSite: "Strict",
                })
            }
        })
        .catch((error) => {
            console.error(error.response ? error.response : error)
            Cookies.remove("azionAccessToken")
            Cookies.remove("azionRefreshToken")
            window.location.href = "/login"
        })
}

const OrgSettingsForm = () => {
    const [orgData, setOrgData] = useState<{
        [key: string]: string
    }>({
        orgName: "",
        orgAddress: "",
        orgEmail: "",
        orgType: "",
        orgPhone: "",
        orgDescription: "",
    })
    const [invitePopUp, setInvitePopUp] = useState<boolean>(false)
    const [people, setPeople] = useState<PeopleData>({})
    const [madeChange, setMadeChange] = useState(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [conString, setConString] = useState<string>("")

    useEffect(() => {
        const fetchOrgData = async () => {
            try {
                const response: AxiosResponse = await axios.get(`${apiUrl}/org/${Cookies.get("azionAccessToken")}`, {
                    headers: {"Content-Type": "application/json"},
                })
                setOrgData({
                    orgName: response.data.orgName,
                    orgAddress: response.data.orgAddress,
                    orgEmail: response.data.orgEmail,
                    orgType: response.data.orgType,
                    orgPhone: response.data.orgPhone,
                    orgDescription: response.data.orgDescription,
                })
            } catch (error) {
                console.error(error)
            }
        }

        fetchOrgData()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target
        setOrgData((prevState) => ({
            ...prevState,
            [name]: value,
        }))
        setMadeChange(true)
    }

    const handleInviteChange = () => {
        setInvitePopUp(!invitePopUp)
    }

    const handleSave = async () => {
        if (orgData["orgName"].includes(" ")) {
            alert("Organization name can't contain spaces")
        } else {
            try {
                await axios.put(`${apiUrl}/org/update/${Cookies.get("azionAccessToken")}`, orgData, {
                    headers: {"Content-Type": "application/json"},
                })
                setMadeChange(false)
                alert("Organization details updated successfully")
            } catch (error) {
                console.error(error)
                alert("Failed to update organization details")
            }
        }
    }

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken")
        const accessToken = Cookies.get("azionAccessToken")

        if (refreshToken && accessToken) {
            PartOfOrg(true).then()
            SessionCheck()
            setTimeout(() => {
                UserData().then(() => {
                    setLoading(false)
                })
            }, 1000)
        } else if (!accessToken && !refreshToken) {
            window.location.href = "/login"
        }
    }, [])

    useEffect(() => {
        OrgConnString()
            .then((data: string) => {
                setConString(data)
            })
            .catch((error) => {
                console.error(error)
            })
    }, [])

    useEffect(() => {
        const accessToken = Cookies.get("azionAccessToken")

        const getPeople = async () => {
            try {
                const response: AxiosResponse = await axios.get(`${apiUrl}/org/get/invites`, {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: accessToken,
                    },
                })

                setPeople(response.data)
            } catch (e) {
                console.error(e)
            }
        }

        getPeople()
    }, [])

    const copyLink = () => {
        navigator.clipboard.writeText(`${clientUrl}/organizations/${conString}`)
    }

    const copyConStr = () => {
        navigator.clipboard.writeText(conString)
        alert("Connection code copied to clipboard")
    }

    const inviteUser = async (id: string) => {
        const accessToken: string | undefined = Cookies.get("azionAccessToken")
        const link = `${clientUrl}/organizations/${conString}`
        try {
            await axios.put(
                `${apiUrl}/org/invite/${id}`,
                {},
                {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: accessToken,
                        data: link,
                    },
                },
            )
            // Close the modal after successful invitation
            setInvitePopUp(false)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="w-full h-dvh">
            <div>
                <h2 className="text-3xl sm:text-4xl font-semibold text-white p-8 md:p-16">
                    Organization Settings
                </h2>

                <div className="w-full flex flex-col justify-start gap-8">
                    <div className="flex flex-col justify-center items-center gap-10">
                        <div
                            className="w-full h-full max-w-3xl mx-auto border border-blue-900/30 bg-gradient-to-b from-blue-900/10 to-transparent rounded-lg shadow-[0_0_30px_rgba(14,165,233,0.07)] overflow-hidden">
                            {/* Organization Name, Email, Phone Section */}
                            <div
                                className="px-6 sm:px-8 py-8 border-b border-blue-900/30 flex flex-col justify-evenly items-center gap-6">
                                <div className="w-full h-full flex flex-col justify-evenly items-start gap-6 sm:gap-8">
                                    {[
                                        {name: "orgName", icon: <IoPerson className="text-blue-400"/>, label: "Name"},
                                        {name: "orgEmail", icon: <IoMail className="text-blue-400"/>, label: "Email"},
                                        {name: "orgPhone", icon: <IoCall className="text-blue-400"/>, label: "Phone"},
                                    ].map((field, index) => (
                                        <div className="w-full flex flex-col sm:flex-row sm:items-center group"
                                             key={index}>
                                            <label
                                                className="text-sm font-medium text-gray-300 mb-2 sm:mb-0 sm:w-1/4 capitalize flex items-center gap-2">
                                                {field.icon}
                                                {field.label}
                                            </label>
                                            <div className="w-full sm:w-3/4">
                                                <input
                                                    name={field.name}
                                                    type={field.name === "orgEmail" ? "email" : "text"}
                                                    value={orgData[field.name]}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 text-base text-white bg-blue-900/20 border border-blue-900/40 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                                                    placeholder={`Enter organization ${field.label.toLowerCase()}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Organization Type and Address Section */}
                            <div
                                className="px-6 sm:px-8 py-8 border-b border-blue-900/30 flex flex-col justify-evenly items-center gap-6">
                                <div className="w-full h-full flex flex-col justify-evenly items-start gap-6 sm:gap-8">
                                    {[
                                        {name: "orgType", icon: <IoBusiness className="text-blue-400"/>, label: "Type"},
                                        {
                                            name: "orgAddress",
                                            icon: <IoLocation className="text-blue-400"/>,
                                            label: "Address"
                                        },
                                    ].map((field, index) => (
                                        <div className="w-full flex flex-col sm:flex-row sm:items-center group"
                                             key={index}>
                                            <label
                                                className="text-sm font-medium text-gray-300 mb-2 sm:mb-0 sm:w-1/4 capitalize flex items-center gap-2">
                                                {field.icon}
                                                {field.label}
                                            </label>
                                            <div className="w-full sm:w-3/4">
                                                <input
                                                    name={field.name}
                                                    type="text"
                                                    value={orgData[field.name]}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 text-base text-white bg-blue-900/20 border border-blue-900/40 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                                                    placeholder={`Enter organization ${field.label.toLowerCase()}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="px-6 sm:px-8 py-8">
                                <div className="w-full flex flex-col gap-2 mb-2">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <IoInformationCircle className="text-blue-400"/>
                                        Description
                                    </label>
                                    <textarea
                                        name="orgDescription"
                                        value={orgData.orgDescription}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-3 text-sm text-white bg-blue-900/20 border border-blue-900/40 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                                        rows={4}
                                        placeholder="Describe your organization"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full max-w-3xl mx-auto space-y-4">
                            {madeChange && (
                                <button
                                    onClick={handleSave}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-lg shadow-lg transition duration-200 ease-in-out flex items-center justify-center gap-2"
                                >
                                    <span>Save Changes</span>
                                </button>
                            )}

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleInviteChange}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-lg shadow-lg transition duration-200 ease-in-out flex items-center justify-center gap-2"
                                >
                                    <span>Invite People</span>
                                </button>

                                <div
                                    className="flex flex-col sm:flex-row items-center justify-center gap-2 bg-blue-900/20 border border-blue-900/30 rounded-lg p-4">
                                    <span className="text-gray-300 text-sm">Join with connection code:</span>
                                    <div className="flex items-center">
                                        <code
                                            className="bg-blue-900/30 px-3 py-1 rounded text-blue-300 font-mono">{conString}</code>
                                        <button
                                            onClick={copyConStr}
                                            className="ml-2 p-1.5 rounded-md hover:bg-blue-800/30 text-blue-400 transition-colors"
                                            title="Copy connection code"
                                        >
                                            <IoCopy size={16}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            <InviteModal isOpen={invitePopUp} onClose={handleInviteChange} people={people} inviteUser={inviteUser}
                         link={`${clientUrl}/organizations/${conString}`}/>
        </div>
    )
}

export default OrgSettingsForm
