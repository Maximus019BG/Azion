"use client"

import {useEffect, useRef, useState} from "react"
import axios, {type AxiosResponse} from "axios"
import Cookies from "js-cookie"
import {apiUrl} from "@/app/api/config"
import type {Role, User} from "@/app/types/types"
import {Edit2, Plus, Save, Trash2, X} from "lucide-react"
import {motion} from "framer-motion"

const RoleList = () => {
    const [roles, setRoles] = useState<Role[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [newRole, setNewRole] = useState<string>("")
    const [showNewRole, setShowNewRole] = useState<boolean>(false)
    const [madeChanges, setMadeChanges] = useState<boolean>(false)
    const [saving, setSaving] = useState<boolean>(false)
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
        setSaving(true)
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
            // Show success notification
            const notification = document.getElementById("notification")
            if (notification) {
                notification.classList.remove("hidden")
                setTimeout(() => {
                    notification.classList.add("hidden")
                }, 3000)
            }
        } catch (error) {
            console.error(error)
            alert("Failed to update roles and user roles")
        } finally {
            setSaving(false)
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
            prevUsers.map((user) =>
                user.role.name === oldRole
                    ? {
                        ...user,
                        role: {...user.role, name: newRole},
                    }
                    : user,
            ),
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
            setRoles((prevRoles) => [...prevRoles, {id: null, name: newRole, roleAccess: null, color: "#3b82f6"}])
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

    const fadeInUp = {
        hidden: {opacity: 0, y: 20},
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.5,
            },
        }),
    }

    return (
        <div className="w-full space-y-8 sm:space-y-12">
            {/* Success notification */}
            <div
                id="notification"
                className="hidden fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center gap-2"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Roles updated successfully</span>
            </div>

            {/* Roles Section */}
            <motion.section initial="hidden" animate="visible" variants={fadeInUp} custom={0} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-semibold text-white">Edit Roles</h2>
                    <div
                        className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-800/30 to-transparent mx-4"></div>
                </div>

                <div className="space-y-4">
                    {roles.map((role, index) => (
                        <motion.div
                            key={index}
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            custom={index + 1}
                            className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg p-3 hover:border-blue-800/50 transition-colors"
                        >
                            <input
                                type="text"
                                value={role.name}
                                onChange={(e) => handleRoleNameChange(role.name, e.target.value)}
                                className={`w-full sm:w-auto flex-grow bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${role.name === "owner" ? "cursor-not-allowed opacity-50" : ""}`}
                                ref={(el) => {
                                    refs.current[role.name] = el
                                }}
                                disabled={role.name === "owner"}
                            />
                            <div className="flex space-x-2 w-full sm:w-auto justify-end">
                                <button
                                    onClick={() => editAccess(role.name)}
                                    className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 transition duration-200"
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
                        </motion.div>
                    ))}
                </div>

                {showNewRole ? (
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 bg-[#0c0c14] border border-[#1a1a2e] rounded-lg p-3"
                    >
                        <input
                            type="text"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            placeholder="New Role"
                            className="flex-grow bg-[#1a1a2e] text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-900/30"
                            autoFocus
                        />
                        <div className="flex space-x-2 w-full sm:w-auto justify-end">
                            <button
                                onClick={handleAddRole}
                                className="flex-grow sm:flex-grow-0 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                            >
                                Add Role
                            </button>
                            <button
                                onClick={() => setShowNewRole(false)}
                                className="bg-[#1a1a2e] hover:bg-[#252538] text-white font-medium p-2 rounded-md transition duration-200 border border-blue-900/30"
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <button
                        onClick={() => setShowNewRole(true)}
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition duration-200"
                    >
                        <Plus className="w-5 h-5"/>
                        <span>Add New Role</span>
                    </button>
                )}
            </motion.section>

            {/* User Roles Section */}
            <motion.section
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                custom={roles.length + 1}
                className="space-y-6"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-semibold text-white">Edit User Roles</h2>
                    <div
                        className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-800/30 to-transparent mx-4"></div>
                </div>

                <div className="space-y-4">
                    {users.map((user, index) => (
                        <motion.div
                            key={user.id}
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            custom={roles.length + index + 2}
                            className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg p-3 hover:border-blue-800/50 transition-colors"
                        >
              <span className="flex-grow text-white text-sm sm:text-base">
                {user.name} <span className="text-gray-400">({user.email})</span>
              </span>
                            <select
                                value={user.role.id ?? ""}
                                onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                                className="w-full sm:w-auto bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id ?? ""}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Save Button */}
            {madeChanges && (
                <motion.button
                    initial={{opacity: 0, scale: 0.9}}
                    animate={{opacity: 1, scale: 1}}
                    onClick={handleSave}
                    disabled={saving}
                    className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-full transition duration-200 shadow-lg disabled:opacity-70"
                >
                    {saving ? (
                        <>
                            <svg
                                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5"/>
                            <span className="hidden sm:inline">Save Changes</span>
                        </>
                    )}
                </motion.button>
            )}
        </div>
    )
}

export default RoleList
