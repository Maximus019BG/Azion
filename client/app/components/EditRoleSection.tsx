"use client"

import type React from "react"
import {useEffect, useState} from "react"
import axios, {type AxiosResponse} from "axios"
import {apiUrl} from "@/app/api/config"
import Cookies from "js-cookie"
import type {Role} from "@/app/types/types"
import ColorPicker from "@/app/components/_roles/ColorPicker"
import {AlertTriangle, Check, RefreshCw, Save} from "lucide-react"

interface EditRoleSectionProps {
    RoleName: string
}

const EditRoleSection: React.FC<EditRoleSectionProps> = ({RoleName}) => {
    const [accessFields, setAccessFields] = useState<boolean[]>(Array(8).fill(false))
    const [isSaveEnabled, setIsSaveEnabled] = useState<boolean>(false)
    const [color, setColor] = useState<string>("#2563eb")
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

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

    const handleSave = async () => {
        setSaveStatus("saving")
        const newBinaryString = accessFields
            .map((val, idx) => (val ? permissions[idx] : ""))
            .filter(Boolean)
            .join(" ")

        const data = {
            accessFields: newBinaryString,
            color,
        }

        try {
            await axios.put(`${apiUrl}/org/role/update/${RoleName}`, data, {
                headers: {
                    "Content-Type": "application/json",
                    authorization: Cookies.get("azionAccessToken") || "",
                },
            })
            setSaveStatus("success")
            setIsSaveEnabled(false)

            // Reset status after 3 seconds
            setTimeout(() => {
                setSaveStatus("idle")
            }, 3000)
        } catch (error) {
            console.error("Error updating role access:", error)
            setSaveStatus("error")

            // Reset status after 3 seconds
            setTimeout(() => {
                setSaveStatus("idle")
            }, 3000)
        }
    }

    const handleReset = () => {
        setAccessFields(Array(8).fill(false))
        setIsSaveEnabled(true)
    }

    const permissionFields = [
        {
            label: "Calendar Management",
            description: "Allows creating and scheduling meetings or events.",
            permission: "calendar:write",
            icon: "📅",
        },
        {
            label: "Organization Settings",
            description: "Gives access to modify organization-wide settings.",
            permission: "settings:write settings:read",
            icon: "⚙️",
        },
        {
            label: "Employee Data Access",
            description: "Allows viewing details of employees in the system.",
            permission: "employees:read",
            icon: "👥",
        },
        {
            label: "Role Management",
            description: "Grants the ability to assign roles and modify access rights.",
            permission: "roles:write roles:read",
            icon: "🔑",
        },
        {
            label: "Task Creation",
            description: "Enables users to create and assign tasks.",
            permission: "tasks:write",
            icon: "✏️",
        },
        {
            label: "Task Viewing",
            description: "Allows users to view and track assigned tasks.",
            permission: "tasks:read",
            icon: "👁️",
        },
        {
            label: "Camera Management",
            description: "Permission to integrate and add Azion security cameras.",
            permission: "cameras:write",
            icon: "📹",
        },
        {
            label: "Camera Logs Access",
            description: "Enables access to view and analyze security camera logs.",
            permission: "cameras:read",
            icon: "📊",
        },
    ]

    return (
        <div className="size-full bg-base-300 flex flex-col lg:flex-row ">
            {/* Permissions Panel */}
            <div className="w-full lg:w-3/4 p-4">
                <div className="grid gap-4">
                    {permissionFields.map((field, index) => (
                        <div
                            key={index}
                            className={`bg-gray-750 rounded-lg overflow-hidden transition-all duration-200 ${
                                accessFields[index] ? "border-l-4 border-blue-500" : "border-l-4 border-transparent"
                            }`}
                        >
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="text-xl mt-1">{field.icon}</div>
                                    <div>
                                        <h3 className="font-medium text-white">{field.label}</h3>
                                        <p className="text-sm text-gray-400 mt-1">{field.description}</p>
                                    </div>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={accessFields[index]}
                                        disabled={RoleName === "owner"}
                                        onChange={() => handleToggle(index)}
                                    />
                                    <div
                                        className={`
                                            w-11 h-6 bg-gray-700 rounded-full peer 
                                            peer-checked:after:translate-x-full peer-checked:after:border-white 
                                            after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
                                            after:bg-gray-400 after:border-gray-300 after:border after:rounded-full 
                                            after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600
                                            ${RoleName === "owner" ? "opacity-50 cursor-not-allowed" : ""}`}
                                    ></div>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Color Picker & Action Buttons */}
            <div className="w-full lg:w-1/4 p-4 bg-gray-750 lg:bg-transparent lg:border-l border-gray-700 overflow-y-auto">
                <div className="sticky top-4 ">
                    <div className="mb-6 ">
                        <h3 className="text-lg font-medium mb-2">Role Color</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Choose a color to visually identify this role throughout the system
                        </p>

                        <ColorPicker color={color} setColor={setColor} setIsSaveEnabled={setIsSaveEnabled}/>
                    </div>

                    <div className="flex flex-col gap-3 mt-8">
                        <button
                            className={`
                flex items-center justify-center gap-2 py-2 px-4 rounded-md
                ${
                                saveStatus === "success"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : saveStatus === "error"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : saveStatus === "saving"
                                            ? "bg-gray-600"
                                            : "bg-blue-600 hover:bg-blue-700"
                            }
                transition-colors duration-200
                ${!isSaveEnabled && saveStatus === "idle" ? "opacity-50 cursor-not-allowed" : ""}
              `}
                            onClick={handleSave}
                            disabled={!isSaveEnabled || saveStatus === "saving"}
                        >
                            {saveStatus === "saving" ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin"/>
                                    Saving...
                                </>
                            ) : saveStatus === "success" ? (
                                <>
                                    <Check className="h-4 w-4"/>
                                    Saved!
                                </>
                            ) : saveStatus === "error" ? (
                                <>
                                    <AlertTriangle className="h-4 w-4"/>
                                    Error!
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4"/>
                                    Save Changes
                                </>
                            )}
                        </button>

                        <button
                            className="flex items-center justify-center gap-2 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
                            onClick={handleReset}
                        >
                            <RefreshCw className="h-4 w-4"/>
                            Reset All
                        </button>
                    </div>

                    {RoleName === "owner" && (
                        <div className="mt-6 p-3 bg-yellow-900/30 border border-yellow-800/50 rounded-md">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5"/>
                                <p className="text-sm text-yellow-200">
                                    The Owner role permissions cannot be modified as it has full system access by
                                    default.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EditRoleSection

