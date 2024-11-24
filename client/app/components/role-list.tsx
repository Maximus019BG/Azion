"use client";
import React, {useEffect, useRef, useState} from "react";
import axios, {AxiosResponse} from "axios";
import Cookies from "js-cookie";
import {apiUrl} from "@/app/api/config";

interface User {
    id: string;
    name: string;
    role: string;
    email: string;
}

const RoleList = () => {
    const [roles, setRoles] = useState<{ [key: string]: number }>({});
    const [users, setUsers] = useState<User[]>([]);
    const [newRole, setNewRole] = useState<string>("");
    const [newLevel, setNewLevel] = useState<number>(0);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [showNewRole, setShowNewRole] = useState<boolean>(false);
    const refs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response: AxiosResponse = await axios.get(
                    `${apiUrl}/org/list/roles/${Cookies.get("azionAccessToken")}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                setRoles(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response: AxiosResponse<User[]> = await axios.get(
                    `${apiUrl}/org/list/employees`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            authorization: Cookies.get("azionAccessToken"),
                        },
                    }
                );
                setUsers(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchRoles();
        fetchUsers();
    }, []);

    const handleSave = async () => {
        try {
            const payload = {
                roles: roles,
                users: users.reduce((acc, user) => {
                    acc[user.email] = user.role;
                    return acc;
                }, {} as { [key: string]: string }),
            };
            await axios.put(
                `${apiUrl}/org/update/roles/${Cookies.get("azionAccessToken")}`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            setAlertMessage("Roles and user roles updated successfully");
            setTimeout(() => setAlertMessage(null), 2500);
        } catch (error) {
            console.error(error);
            setAlertMessage("Failed to update roles and user roles");
        }
    };

    const handleInputChange = (role: string, value: number) => {
        setRoles((prevRoles) => ({
            ...prevRoles,
            [role]: value,
        }));
    };

    const handleRoleNameChange = (oldRole: string, newRole: string) => {
        setRoles((prevRoles) => {
            const updatedRoles = {...prevRoles};
            const level = updatedRoles[oldRole];
            delete updatedRoles[oldRole];
            updatedRoles[newRole] = level;
            return updatedRoles;
        });
        setTimeout(() => {
            if (refs.current[newRole]) {
                refs.current[newRole]?.focus();
            }
        }, 0);
    };

    const handleUserRoleChange = (userId: string, newRole: string) => {
        setUsers((prevUsers) => {
            return prevUsers.map((user) => {
                if (user.id === userId) {
                    if (user.role === "owner" && newRole !== "owner") {
                        const confirmChange = window.confirm("Are you sure you want to change the owner role to someone else?");
                        if (!confirmChange) {
                            return user;
                        }
                    }
                    return {
                        ...user,
                        role: newRole,
                    };
                }
                return user;
            });
        });
    };

    const handleAddRole = () => {
        if (newRole && newLevel > 0 && !roles[newRole]) {
            setRoles((prevRoles) => ({
                ...prevRoles,
                [newRole]: newLevel,
            }));
            setNewRole("");
            setNewLevel(0);
            setShowNewRole(false);
        } else {
            setAlertMessage("Role already exists or invalid level.");
        }
    };

    const handleRemoveRole = (role: string) => {
        setRoles((prevRoles) => {
            const updatedRoles = {...prevRoles};
            delete updatedRoles[role];
            return updatedRoles;
        });
    };

    return (
        <div
            className="w-[75vw] h-full max-w-4xl p-8 bg-base-300 shadow-lg rounded-md flex flex-col justify-center items-center gap-12">
            {/* Roles Section */}
            <div className="w-full flex flex-col ">
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">Edit Roles</h2>
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs uppercase bg-base-100 text-gray-400">
                    <tr>
                        <th scope="col" className="py-3 px-6">Role Name</th>
                        <th scope="col" className="py-3 px-6">Level</th>
                        <th scope="col" className="py-3 px-6">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.entries(roles).map(([role, level], index) => (
                        <tr key={index} className={`border-t bg-base-200 even:bg-slate-950 border-gray-700`}>
                            <td className="py-4 px-6">
                                <input
                                    type="text"
                                    value={role}
                                    onChange={(e) => handleRoleNameChange(role, e.target.value)}
                                    className={`bg-gray-700  border-non focus:outline-none rounded w-full py-2 px-3 ${role === "owner" ? "cursor-not-allowed text-gray-400" : "text-white"}`}
                                    ref={(el) => {
                                        refs.current[role] = el;
                                    }}
                                    disabled={role === "owner"}
                                />
                            </td>
                            <td className="py-4 px-6">
                                <input
                                    type="number"
                                    value={level}
                                    onChange={(e) => handleInputChange(role, parseInt(e.target.value))}
                                    className={`bg-gray-700 border-none focus:outline-none rounded w-full py-2 px-3 ${role === "owner" ? "cursor-not-allowed text-gray-400" : "text-white"}`}
                                    disabled={role === "owner"}
                                />
                            </td>
                            <td className="py-4 px-6">
                                <button
                                    onClick={() => handleRemoveRole(role)}
                                    className={`font-medium ${role === "owner" ? "text-gray-500 cursor-not-allowed" : "text-red-500 hover:text-red-600"}`}
                                    disabled={role === "owner"}
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <button
                    onClick={() => setShowNewRole(!showNewRole)}
                    className="mt-4 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-md py-2 px-4 transition duration-200 self-end"
                >
                    {showNewRole ? "Cancel" : "Add New Role"}
                </button>
                {showNewRole && (
                    <div className="mt-4 flex gap-4">
                        <input
                            type="text"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            placeholder="New Role"
                            className="bg-gray-700 text-white border-none focus:outline-none rounded w-full py-2 px-3"
                        />
                        <input
                            type="number"
                            value={newLevel}
                            onChange={(e) => setNewLevel(parseInt(e.target.value))}
                            placeholder="Level"
                            className="bg-gray-700 text-white border-none focus:outline-none rounded w-1/3 py-2 px-3"
                        />
                        <button
                            onClick={handleAddRole}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 w-1/5 rounded transition duration-200"
                        >
                            Add Role
                        </button>
                    </div>
                )}
            </div>
            {/* User Roles Section */}
            <div className="w-full">
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">Edit User Roles</h2>
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs uppercase bg-base-100 text-gray-400">
                    <tr>
                        <th scope="col" className="py-3 px-6">User Name</th>
                        <th scope="col" className="py-3 px-6">Role</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b bg-base-200 border-gray-700">
                            <td className="py-4 ">{user.name} ({user.email})</td>
                            <td className="py-4">
                                <select
                                    value={user.role}
                                    onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                                    className="bg-gray-700 text-white border-none focus:outline-none rounded w-full py-2 px-3"
                                >
                                    {Object.keys(roles).map((role) => (
                                        <option key={role} value={role} className="text-black">
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {/* Save Button and Alert Message */}
            <div className="w-full mt-8">
                <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition duration-200"
                >
                    Save Changes
                </button>
            </div>
            {alertMessage && (
                <div className="mt-4 text-white bg-gray-700 p-3 rounded">
                    {alertMessage}
                </div>
            )}
        </div>
    );
};

export default RoleList;