import React, {useEffect, useRef, useState} from "react";
import axios, {AxiosResponse} from "axios";
import Cookies from "js-cookie";
import {apiUrl} from "@/app/api/config";
import {Role} from "@/app/types/types";
import {User} from "@/app/types/types";

const RoleList = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [newRole, setNewRole] = useState<string>("");
    const [newLevel, setNewLevel] = useState<string>("");
    const [showNewRole, setShowNewRole] = useState<boolean>(false);
    const [madeChanges, setMadeChanges] = useState<boolean>(false);
    const refs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response: AxiosResponse<Role[]> = await axios.get(
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
                roles: roles.map(role => ({
                    id: role.id,
                    name: role.name,
                    roleAccess: role.roleAccess,
                    color: role.color
                })),
                users: users.map(user => ({
                    id: user.id,
                    name: user.name,
                    role: user.role,
                    email: user.email
                })),
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

            setMadeChanges(false);
            alert("Roles and user roles updated successfully");
        } catch (error) {
            console.error(error);
            alert("Failed to update roles and user roles");
        }
    };

    const handleRoleNameChange = (oldRole: string, newRole: string) => {
        if (roles.some(role => role.name === newRole)) {
            alert("This role name already exists.");
            return;
        }

        setRoles((prevRoles) => {
            const updatedRoles = prevRoles.map(role => {
                if (role.name === oldRole) {
                    return {...role, name: newRole};
                }
                return role;
            });
            return updatedRoles;
        });

        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.role.name === oldRole ? {...user, role: {...user.role, name: newRole}} : user
            )
        );

        setTimeout(() => {
            if (refs.current[newRole]) {
                refs.current[newRole]?.focus();
            }
        }, 0);

        setMadeChanges(true);
    };

    const handleUserRoleChange = (userId: string | null, newRoleId: string | null) => {
        setUsers((prevUsers) => {
            return prevUsers.map((user) => {
                if (user.id === userId) {
                    if (user.role.name === "owner" && newRoleId !== "owner") {
                        const confirmChange = window.confirm("Are you sure you want to change the owner role to someone else?");
                        if (!confirmChange) {
                            return user;
                        }
                    }
                    const newRole = roles.find(role => role.id === newRoleId);
                    return {
                        ...user,
                        role: newRole ? newRole : user.role,
                    };
                }
                return user;
            });
        });
        setMadeChanges(true);
    };

    const handleAddRole = () => {
        if (newRole && !roles.some(role => role.name === newRole)) {
            setRoles((prevRoles) => [
                ...prevRoles,
                {id: null, name: newRole, roleAccess: null, color: "#000000"}
            ]);
            setNewRole("");
            setNewLevel("00000000");
            setShowNewRole(false);
            alert("New role added. Before editing privileges save changes");
        }
        setMadeChanges(true);
    };

    const handleRemoveRole = (roleName: string) => {
        setRoles((prevRoles) => prevRoles.filter(role => role.name !== roleName));
        setMadeChanges(true);
    };

    const editAccess = (role: string) => {
        window.location.href = window.location.pathname + "/" + role;
    }

    return (
        <div
            className="w-full max-w-4xl p-4 sm:p-6 md:p-8 bg-base-300 shadow-lg rounded-md flex flex-col justify-center items-center gap-12">
            {/* Roles Section */}
            <div className="w-full flex flex-col">
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">Edit Roles</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs uppercase bg-base-100 text-gray-400">
                        <tr>
                            <th scope="col" className="py-3 px-6">Role Name</th>
                            <th scope="col" className="py-3 px-6">Edit</th>
                            <th scope="col" className="py-3 px-6">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {roles.map((role, index) => (
                            <tr key={index} className="border-t bg-base-200 even:bg-slate-950 border-gray-700">
                                <td className="py-4 px-6">
                                    <input
                                        type="text"
                                        value={role.name}
                                        onChange={(e) => handleRoleNameChange(role.name, e.target.value)}
                                        className={`bg-gray-700 border-none focus:outline-none rounded w-full py-2 px-3 ${role.name === "owner" ? "cursor-not-allowed text-gray-400" : "text-white"}`}
                                        ref={(el) => {
                                            refs.current[role.name] = el;
                                        }}
                                        disabled={role.name === "owner"}
                                    />
                                </td>
                                <td className="py-4 px-6">
                                    <button
                                        onClick={() => editAccess(role.name)}
                                        className={`bg-gray-700 border-none focus:outline-none rounded w-full py-2 px-3 ${role.name === "owner" ? "cursor-not-allowed text-gray-400" : "text-white"}`}
                                    >Edit
                                    </button>
                                </td>
                                <td className="py-4 px-6">
                                    <button
                                        onClick={() => handleRemoveRole(role.name)}
                                        className={`font-medium ${role.name === "owner" ? "text-gray-500 cursor-not-allowed" : "text-red-500 hover:text-red-600"}`}
                                        disabled={role.name === "owner"}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <button
                    onClick={() => setShowNewRole(!showNewRole)}
                    className="mt-4 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-md py-2 px-4 transition duration-200 self-end"
                >
                    {showNewRole ? "Cancel" : "Add New Role"}
                </button>
                {showNewRole && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            placeholder="New Role"
                            className="bg-gray-700 text-white border-none focus:outline-none rounded w-full py-2 px-3"
                        />
                        <button
                            onClick={() => handleAddRole()}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 w-full sm:w-1/5 rounded transition duration-200"
                        >
                            Add Role
                        </button>
                    </div>
                )}
            </div>
            {/* User Roles Section */}
            <div className="w-full">
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">Edit User Roles</h2>
                <div className="overflow-x-auto">
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
                                <td className="py-4">{user.name} ({user.email})</td>
                                <td className="py-4">
                                    <select
                                        value={user.role.id ?? ""}
                                        onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                                        className="bg-gray-700 text-white border-none focus:outline-none rounded w-full py-2 px-3"
                                    >
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id} className="text-black">
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Save Button and Alert Message */}
            {madeChanges && (<div className="w-full mt-8">
                <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition duration-200"
                >
                    Save Changes
                </button>
            </div>)}

        </div>
    );
};

export default RoleList;