import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '@/app/api/config';
import {UserData} from "@/app/func/funcs";

interface User {
    id: string;
    name: string;
    role: string;
    email: string;
}

const RoleList = () => {
    const [roles, setRoles] = useState<{ [key: string]: number }>({});
    const [users, setUsers] = useState<User[]>([]);
    const [newRole, setNewRole] = useState<string>('');
    const [newLevel, setNewLevel] = useState<number>(0);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [showNewRole, setShowNewRole] = useState<boolean>(false);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response: AxiosResponse = await axios.get(`${apiUrl}/org/list/roles/${Cookies.get("azionAccessToken")}`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                setRoles(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response: AxiosResponse<User[]> = await axios.get(`${apiUrl}/org/list/employees`, {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: Cookies.get("azionAccessToken"),
                    },
                });
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
                }, {} as { [key: string]: string })
            };
            await axios.put(`${apiUrl}/org/update/roles/${Cookies.get("azionAccessToken")}`, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setAlertMessage('Roles and user roles updated successfully');
        } catch (error) {
            console.error(error);
            setAlertMessage('Failed to update roles and user roles');
        }
    };

    const handleInputChange = (role: string, value: number) => {
        setRoles(prevRoles => ({
            ...prevRoles,
            [role]: value
        }));
    };

    const handleRoleNameChange = (oldRole: string, newRole: string) => {
        setRoles(prevRoles => {
            const updatedRoles = { ...prevRoles };
            const level = updatedRoles[oldRole];
            delete updatedRoles[oldRole];
            updatedRoles[newRole] = level;
            return updatedRoles;
        });
    };

    const handleUserRoleChange = (userId: string, newRole: string) => {
        setUsers(prevUsers => {
            const updatedUsers = prevUsers.map(user => {
                if (user.id === userId) {
                    return {
                        ...user,
                        role: newRole
                    };
                }
                return user;
            });
            return updatedUsers;
        });

    };

    const handleAddRole = () => {
        if (newRole && newLevel > 0) {
            setRoles(prevRoles => ({
                ...prevRoles,
                [newRole]: newLevel
            }));
            setNewRole('');
            setNewLevel(0);
            setShowNewRole(false);
        }
    };

    const handleRemoveRole = (role: string) => {
        setRoles(prevRoles => {
            const updatedRoles = { ...prevRoles };
            delete updatedRoles[role];
            return updatedRoles;
        });
    };

    return (
        <div className="w-full p-6 bg-slate-900 shadow-md rounded-lg flex gap-24">
            <div className="w-1/2 p-4">
                <h2 className="text-3xl text-center font-bold text-neonAccent mb-4">Edit Roles</h2>
                <table className="w-full text-white">
                    <thead>
                    <tr>
                        <th className="text-left py-2 px-4">Role Name</th>
                        <th className="text-left py-2 px-4">Level</th>
                        <th className="text-left py-2 px-4">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.entries(roles).map(([role, level]) => (
                        <tr key={role}>
                            <td className="py-2 px-4">
                                <input
                                    type="text"
                                    value={role}
                                    onChange={(e) => handleRoleNameChange(role, e.target.value)}
                                    className="bg-transparent border-b border-gray-500 text-white py-1 px-2 focus:outline-none"
                                />
                            </td>
                            <td className="py-2 px-4">
                                <input
                                    type="number"
                                    value={level}
                                    onChange={(e) => handleInputChange(role, parseInt(e.target.value))}
                                    className="bg-transparent border-b border-gray-500 text-white py-1 px-2 focus:outline-none"
                                />
                            </td>
                            <td className="py-2 px-4">
                                <button
                                    onClick={() => handleRemoveRole(role)}
                                    className="text-red-500 hover:text-red-700 font-bold py-1 px-2 focus:outline-none"
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
                    className="bg-accent hover:bg-blue-950 text-neonAccent font-bold py-2 px-4 rounded-3xl focus:outline-none focus:shadow-outline mt-4"
                >
                    {showNewRole ? '-' : '+'}
                </button>
                {showNewRole && (
                    <div className="mt-4">
                        <input
                            type="text"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            placeholder="New Role"
                            className="bg-transparent border-b border-gray-500 text-white py-1 px-2 focus:outline-none mr-2"
                        />
                        <input
                            type="number"
                            value={newLevel}
                            onChange={(e) => setNewLevel(parseInt(e.target.value))}
                            placeholder="Level"
                            className="bg-transparent border-b border-gray-500 text-white py-1 px-2 focus:outline-none mr-2"
                        />
                        <button
                            onClick={handleAddRole}
                            className="bg-accent hover:bg-blue-950 text-neonAccent font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Add Role
                        </button>
                    </div>
                )}
            </div>
            <div className="w-1/2 p-4">
                <h2 className="text-3xl text-center font-bold text-neonAccent mb-4 w-full">Edit User Roles</h2>
                <table className="w-full text-white">
                    <thead>
                    <tr>
                        <th className="text-left py-2 px-4">User Name</th>
                        <th className="text-left py-2 px-4">Role</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="py-2 px-4">{user.name}</td>
                             <td className="py-2 px-4">
                                <select
                                    value={user.role}
                                    onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                                    className="bg-transparent border-b border-gray-500 text-white py-1 px-2 focus:outline-none"
                                >
                                    {Object.keys(roles).map(role => (
                                        <option key={role} value={role} className="text-black">{role}</option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end w-full mt-4">
                <button
                    onClick={handleSave}
                    className="bg-accent hover:bg-blue-950 text-neonAccent font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Save
                </button>
            </div>
            {alertMessage && (
                <div className="mt-4 text-white">
                    {alertMessage}
                </div>
            )}
        </div>
    );
};

export default RoleList;