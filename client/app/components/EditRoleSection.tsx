"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "@/app/api/config";
import Cookies from "js-cookie";

interface EditRoleSectionProps {
    RoleName: string;
}

const EditRoleSection: React.FC<EditRoleSectionProps> = ({ RoleName }) => {
    const [accessFields, setAccessFields] = useState<boolean[]>(Array(8).fill(false));
    const [binaryString, setBinaryString] = useState<string>("00000000");

    useEffect(() => {
        const fetchRoleAccess = async () => {
            try {
                const response = await axios.get(`${apiUrl}/org/role/access/${RoleName}`, {
                    headers: {
                        authorization: Cookies.get("azionAccessToken") || "",
                    },
                });

                let accessBinaryString: string = response.data.toString();

                const binaryStringLength = 8;
                const paddedBinaryString = accessBinaryString.padStart(binaryStringLength, "0").slice(0, binaryStringLength);

                let updatedFields: boolean[] = Array(binaryStringLength).fill(false);

                // Map the binary string to the boolean array
                for (let i = 0; i < paddedBinaryString.length; i++) {
                    updatedFields[i] = paddedBinaryString[i] === "1";
                }

                setBinaryString(paddedBinaryString);
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

        // Update the binary string
        const newBinaryString = updatedFields.map((val) => (val ? "1" : "0")).join("");
        setBinaryString(newBinaryString);

        // Send request to server
        const data = {
            accessFields: newBinaryString,
        };
        axios.put(`${apiUrl}/org/role/update/${RoleName}`, data, {
            headers: {
                "Content-Type": "application/json",
                authorization: Cookies.get("azionAccessToken") || "",
            },
        }).catch((error) => console.error("Error updating role access:", error));
    };

    const handleReset = () => {
        // Reset all toggles to false
        setAccessFields(Array(8).fill(false));
        setBinaryString("00000000");
    };

    return (
        <div className="h-fit w-full flex flex-col justify-center items-center space-y-4 p-4">
            {[
                { label: "Calendar" },
                { label: "Settings" },
                { label: "Employees" },
                { label: "Roles" },
                { label: "Create Tasks" },
                { label: "View Tasks" },
                { label: "Azion Cameras (Write)" },
                { label: "Azion Cameras (Read)" },
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

            {/* Reset Button */}
            <button
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700"
                onClick={handleReset}
            >
                Reset
            </button>
        </div>
    );
};

export default EditRoleSection;
