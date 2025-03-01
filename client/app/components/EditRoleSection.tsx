"use client"

import type React from "react"
import {useEffect, useState} from "react"
import axios, {type AxiosResponse} from "axios"
import {apiUrl} from "@/app/api/config"
import Cookies from "js-cookie"
import type {Role} from "@/app/types/types"
import ColorPicker from "@/app/components/_roles/ColorPicker";

interface EditRoleSectionProps {
    RoleName: string
}

const EditRoleSection: React.FC<EditRoleSectionProps> = ({RoleName}) => {
    const [accessFields, setAccessFields] = useState<boolean[]>(Array(8).fill(false))
    const [isSaveEnabled, setIsSaveEnabled] = useState<boolean>(false)
    const [color, setColor] = useState<string>("#2563eb")

    const permissions = [
        "calendar:write",
        "settings:write settings:read",
        "employees:read",
        "roles:write roles:read",
        "tasks:write",
        "tasks:read",
        "cameras:write",
        "cameras:read",
    ]

    useEffect(() => {
        const fetchRoleAccess = async () => {
            try {
                const response: AxiosResponse<Role> = await axios.get(`${apiUrl}/org/get/role/${RoleName}`, {
                    headers: {
                        authorization: Cookies.get("azionAccessToken") || "",
                    },
                })

                // @ts-ignore
                const accessBinaryString: string = response.data.roleAccess.toString()
                const updatedFields = permissions.map((permission) => accessBinaryString?.includes(permission))
                setColor(response.data.color)
                if (updatedFields) {
                    setAccessFields(updatedFields)
                }
            } catch (error) {
                console.error("Error fetching role access:", error)
            }
        }

        fetchRoleAccess()
    }, [RoleName])

    const handleToggle = (index: number) => {
        const updatedFields = [...accessFields]
        updatedFields[index] = !updatedFields[index]
        setAccessFields(updatedFields)
        setIsSaveEnabled(true)
    }

    const handleSave = () => {
        const newBinaryString = accessFields
            .map((val, idx) => (val ? permissions[idx] : ""))
            .filter(Boolean)
            .join(" ")
        const data = {
            accessFields: newBinaryString,
            color,
        }
        axios
            .put(`${apiUrl}/org/role/update/${RoleName}`, data, {
                headers: {
                    "Content-Type": "application/json",
                    authorization: Cookies.get("azionAccessToken") || "",
                },
            })
            .catch((error) => console.error("Error updating role access:", error))
        setIsSaveEnabled(false)
    }

    const handleReset = () => {
        setAccessFields(Array(8).fill(false))
        setIsSaveEnabled(false)
    }

    const permissionFields = [
        {label: "Add Meetings/Events", description: "Allows creating and scheduling meetings or events."},
        {label: "Edit Organization Settings", description: "Gives access to modify organization-wide settings."},
        {label: "View Employees Data", description: "Allows viewing details of employees in the system."},
        {
            label: "Change Roles and Permissions",
            description: "Grants the ability to assign roles and modify access rights.",
        },
        {label: "Create Tasks", description: "Enables users to create and assign tasks."},
        {label: "View Tasks", description: "Allows users to view and track assigned tasks."},
        {label: "Add Azion Cameras", description: "Permission to integrate and add Azion security cameras."},
        {label: "Read Logs on Azion Cameras", description: "Enables access to view and analyze security camera logs."},
    ]

    return (
        <div
            className="w-full h-full flex flex-col lg:flex-row justify-center items-start space-y-4 lg:space-y-0 lg:space-x-4 p-4">
            {/* Permissions Panel */}
            <div
                className="w-full h-full lg:w-3/4 border-2 border-slate-700 rounded-md flex flex-col justify-center items-center">
                {permissionFields.map((field, index) => (
                    <div
                        key={index}
                        className={`flex flex-col w-full p-4 ${
                            index !== permissionFields.length - 1 ? "border-b-2 border-b-slate-700" : ""
                        }`}
                    >
                        {/* Toggle and Label */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div className="flex flex-col mb-2 sm:mb-0">
                                <h1 className="text-white text-base sm:text-lg">{field.label}</h1>
                                {/* Description */}
                                <p className="text-gray-400 text-xs sm:text-sm">{field.description}</p>
                            </div>
                            <input
                                className={`self-start sm:self-center mt-2 sm:mt-0 toggle ${
                                    RoleName !== "owner" ? "" : "disabled cursor-not-allowed"
                                } ${accessFields[index] ? "toggle-accent" : ""}`}
                                type="checkbox"
                                checked={accessFields[index]}
                                disabled={RoleName === "owner"}
                                onChange={() => handleToggle(index)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Color Picker & Action Buttons */}
            <div
                className="bg-background h-full w-full flex flex-col space-y-6 justify-center items-center lg:w-1/4 mt-4 lg:mt-0">
                <div className="w-full h-full flex justify-center items-center">
                    <ColorPicker color={color} setColor={setColor} setIsSaveEnabled={setIsSaveEnabled}/>
                </div>

                {/* Reset & Save Buttons */}
                <div className="w-full flex flex-row justify-center items-center space-x-4">
                    <button
                        className="py-1 px-6 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 transition-colors duration-200"
                        onClick={handleReset}
                    >
                        Reset
                    </button>
                    <button
                        className={`py-1 px-6 bg-accent text-white rounded-md shadow-md hover:bg-lightAccent transition-colors duration-200 ${
                            !isSaveEnabled && "opacity-50 cursor-not-allowed"
                        }`}
                        onClick={handleSave}
                        disabled={!isSaveEnabled}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditRoleSection

