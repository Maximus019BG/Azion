import React, {useEffect, useState} from "react";
import axios from "axios";
import {apiUrl} from "@/app/api/config";
import Cookies from "js-cookie";

interface EditRoleSectionProps {
    RoleName: string;
}

const EditRoleSection: React.FC<EditRoleSectionProps> = ({RoleName}) => {
    const [accessFields, setAccessFields] = useState<boolean[]>(Array(8).fill(false));
    const [color, setColor] = useState<string>("#2563eb");
    const [isSaveEnabled, setIsSaveEnabled] = useState<boolean>(false);

    const permissions = [
        "calendar:write",
        "settings:write settings:read",
        "employees:read",
        "roles:write roles:read",
        "tasks:write",
        "tasks:read",
        "cameras:write",
        "cameras:read",
    ];

    useEffect(() => {
        const fetchRoleAccess = async () => {
            try {
                const response = await axios.get(`${apiUrl}/org/role/access/${RoleName}`, {
                    headers: {
                        authorization: Cookies.get("azionAccessToken") || "",
                    },
                });

                const accessBinaryString: string = response.data.toString();
                const updatedFields = permissions.map(permission => accessBinaryString.includes(permission));

                setAccessFields(updatedFields);
            } catch (error) {
                console.error("Error fetching role access:", error);
            }
        };

        fetchRoleAccess();
    }, [RoleName]);

    const handleToggle = (index: number) => {
        const updatedFields = [...accessFields];
        updatedFields[index] = !updatedFields[index];
        setAccessFields(updatedFields);
        setIsSaveEnabled(true);
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColor(e.target.value);
        setIsSaveEnabled(true);
    };

    const handleSave = () => {
        const newBinaryString = accessFields.map((val, idx) => (val ? permissions[idx] : "")).filter(Boolean).join(" ");
        const data = {
            accessFields: newBinaryString,
            color,
        };
        axios.put(`${apiUrl}/org/role/update/${RoleName}`, data, {
            headers: {
                "Content-Type": "application/json",
                authorization: Cookies.get("azionAccessToken") || "",
            },
        }).catch((error) => console.error("Error updating role access:", error));
        setIsSaveEnabled(false);
    };

    const handleReset = () => {
        setAccessFields(Array(8).fill(false));
        setIsSaveEnabled(false);
    };

    return (
        <div className="h-fit w-full flex flex-col justify-center items-center space-y-4 p-4">
            {[
                {label: "Calendar"},
                {label: "Settings"},
                {label: "Employees"},
                {label: "Roles"},
                {label: "Create Tasks"},
                {label: "View Tasks"},
                {label: "Azion Cameras (Write)"},
                {label: "Azion Cameras (Read)"},
            ].map((field, index) => (
                <div
                    key={index}
                    className="flex justify-between items-center w-full max-w-md p-4 bg-gray-800 rounded-md shadow-md"
                >
                    <h1 className="text-white text-lg">{field.label}</h1>
                    <input
                        className={`toggle ${accessFields[index] ? "toggle-accent" : ""}`}
                        type="checkbox"
                        checked={accessFields[index]}
                        onChange={() => handleToggle(index)}
                    />
                </div>
            ))}

            <div className="flex flex-col items-center">
                <h2 className="text-white text-lg mb-2">Select Role Color</h2>
                <div className="relative">
                    <input
                        type="color"
                        value={color}
                        onChange={handleColorChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                        className="w-32 h-32 rounded-md"
                        style={{backgroundColor: color}}
                    />
                </div>
            </div>

            <button
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700"
                onClick={handleReset}
            >
                Reset
            </button>
            {isSaveEnabled && (
                <button
                    className={`mt-4 px-4 py-2 rounded-md shadow-md bg-accent text-white hover:bg-lightAccent`}
                    onClick={handleSave}
                    disabled={!isSaveEnabled}
                >
                    Save
                </button>
            )}
        </div>
    );
};

export default EditRoleSection;