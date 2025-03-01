"use client"

import {useEffect, useRef, useState} from "react"
import axios, {type AxiosResponse} from "axios"
import Cookies from "js-cookie"
import {apiUrl} from "@/app/api/config"
import type {Role, User} from "@/app/types/types"
import {Edit2, Plus, Save, Trash2, X} from "lucide-react"

const RoleList = () => {
    const [roles, setRoles] = useState<Role[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [newRole, setNewRole] = useState<string>("")
    const [showNewRole, setShowNewRole] = useState<boolean>(false)
    const [madeChanges, setMadeChanges] = useState<boolean>(false)
    const refs = useRef<{ [key: string]: HTMLInputElement | null }>({})

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response: AxiosResponse<Role[]> = await axios.get(
                    `${apiUrl}/org/list/roles/${Cookies.get("azionAccessToken")}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    },
                )
                setRoles(response.data)
            } catch (error) {
                console.error(error)
            }
        }

        const fetchUsers = async () => {
            try {
                const response: AxiosResponse<User[]> = await axios.get(`${apiUrl}/org/list/employees`, {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: Cookies.get("azionAccessToken"),
                    },
                })
                setUsers(response.data)
            } catch (error) {
                console.error(error)
            }
        }

        fetchRoles()
        fetchUsers()
    }, [])

    const handleSave = async () => {
        try {
            const payload = {
                roles: roles.map((role) => ({
                    id: role.id,
                    name: role.name,
                    roleAccess: role.roleAccess,
                    color: role.color,
                })),
                users: users.map((user) => ({
                    id: user.id,
                    name: user.name,
                    role: user.role,
                    email: user.email,
                })),
            }

            await axios.put(`${apiUrl}/org/update/roles/${Cookies.get("azionAccessToken")}`, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            })

            setMadeChanges(false)
            alert("Roles and user roles updated successfully")
        } catch (error) {
            console.error(error)
            alert("Failed to update roles and user roles")
        }
    }

    const handleRoleNameChange = (oldRole: string, newRole: string) => {
        if (roles.some((role) => role.name === newRole)) {
            alert("This role name already exists.")
            return
        }

        setRoles((prevRoles) => {
            const updatedRoles = prevRoles.map((role) => {
                if (role.name === oldRole) {
                    return {...role, name: newRole}
                }
                return role
            })
            return updatedRoles
        })

        setUsers((prevUsers) =>
            prevUsers.map((user) => (user.role.name === oldRole ? {
                ...user,
                role: {...user.role, name: newRole}
            } : user)),
        )

        setTimeout(() => {
            if (refs.current[newRole]) {
                refs.current[newRole]?.focus()
            }
        }, 0)

        setMadeChanges(true)
    }

    const handleUserRoleChange = (userId: string | null, newRoleId: string | null) => {
        setUsers((prevUsers) => {
            return prevUsers.map((user) => {
                if (user.id === userId) {
                    if (user.role.name === "owner" && newRoleId !== "owner") {
                        const confirmChange = window.confirm("Are you sure you want to change the owner role to someone else?")
                        if (!confirmChange) {
                            return user
                        }
                    }
                    const newRole = roles.find((role) => role.id === newRoleId)
                    return {
                        ...user,
                        role: newRole ? newRole : user.role,
                    }
                }
                return user
            })
        })
        setMadeChanges(true)
    }

    const handleAddRole = () => {
        if (newRole && !roles.some((role) => role.name === newRole)) {
            setRoles((prevRoles) => [...prevRoles, {id: null, name: newRole, roleAccess: null, color: "#000000"}])
            setNewRole("")
            setShowNewRole(false)
            alert("New role added. Before editing privileges save changes")
        }
        setMadeChanges(true)
    }

    const handleRemoveRole = (roleName: string) => {
        setRoles((prevRoles) => prevRoles.filter((role) => role.name !== roleName))
        setMadeChanges(true)
    }

    const editAccess = (role: string) => {
        window.location.href = window.location.pathname + "/" + role
    }

    return (
        <div className="w-full max-w-4xl p-4 sm:p-6 md:p-8 space-y-8 sm:space-y-12">
            {/* Roles Section */}
            <section className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-white">Edit Roles</h2>
                <div className="space-y-4">
                    {roles.map((role, index) => (
                        <div
                            key={index}
                            className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4"
                        >
                            <input
                                type="text"
                                value={role.name}
                                onChange={(e) => handleRoleNameChange(role.name, e.target.value)}
                                className={`w-full sm:w-auto flex-grow bg-gray-700 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${role.name === "owner" ? "cursor-not-allowed opacity-50" : ""}`}
                                ref={(el) => {
                                    refs.current[role.name] = el
                                }}
                                disabled={role.name === "owner"}
                            />
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => editAccess(role.name)}
                                    className={`p-2 rounded-md bg-blue-600 cursor-not-allowed" transition duration-200`}
                                >
                                    <Edit2 className="w-5 h-5 text-white"/>
                                </button>
                                <button
                                    onClick={() => handleRemoveRole(role.name)}
                                    className={`p-2 rounded-md ${role.name === "owner" ? "bg-gray-600 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} transition duration-200`}
                                    disabled={role.name === "owner"}
                                >
                                    <Trash2 className="w-5 h-5 text-white"/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {showNewRole ? (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <input
                            type="text"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            placeholder="New Role"
                            className="flex-grow bg-gray-700 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={handleAddRole}
                                className="flex-grow sm:flex-grow-0 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                            >
                                Add Role
                            </button>
                            <button
                                onClick={() => setShowNewRole(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-medium p-2 rounded-md transition duration-200"
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowNewRole(true)}
                        className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition duration-200"
                    >
                        <Plus className="w-5 h-5"/>
                        <span>Add New Role</span>
                    </button>
                )}
            </section>

            {/* User Roles Section */}
            <section className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-white">Edit User Roles</h2>
                <div className="space-y-4">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4"
                        >
              <span className="flex-grow text-white text-sm sm:text-base">
                {user.name} ({user.email})
              </span>
                            <select
                                value={user.role.id ?? ""}
                                onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                                className="w-full sm:w-auto bg-gray-700 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id ?? ""}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </section>

            {/* Save Button */}
            {madeChanges && (
                <button
                    onClick={handleSave}
                    className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full transition duration-200 shadow-lg"
                >
                    <Save className="w-5 h-5"/>
                    <span className="hidden sm:inline">Save Changes</span>
                </button>
            )}
        </div>
    )
}

export default RoleList

