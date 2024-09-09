"use client";
import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '@/app/api/config';
import CustomAlert from './CustomAlert';

const OrgSettingsForm = () => {
    const [orgName, setOrgName] = useState('');
    const [orgAddress, setOrgAddress] = useState('');
    const [orgEmail, setOrgEmail] = useState('');
    const [orgType, setOrgType] = useState('');
    const [orgPhone, setOrgPhone] = useState('');
    const [orgDescription, setOrgDescription] = useState('');
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrgData = async () => {
            try {
                const response: AxiosResponse = await axios.get(`${apiUrl}/org/${Cookies.get("azionAccessToken")}`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                setOrgName(response.data.orgName);
                setOrgAddress(response.data.orgAddress);
                setOrgEmail(response.data.orgEmail);
                setOrgType(response.data.orgType);
                setOrgPhone(response.data.orgPhone);
                setOrgDescription(response.data.orgDescription);
            } catch (error) {
                console.error(error);
            }
        };

        fetchOrgData();
    }, []);

    const handleSave = async () => {
        try {
            await axios.put(`${apiUrl}/org/update/${Cookies.get("azionAccessToken")}`, {
                orgName,
                orgAddress,
                orgEmail,
                orgType,
                orgPhone,
                orgDescription,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setAlertMessage('Organization details updated successfully');
        } catch (error) {
            console.error(error);
            setAlertMessage('Failed to update organization details');
        }
    };

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return (
        <div className="w-[30vw] h-8/12 p-10 bg-slate-900 shadow-md rounded-badge">
            <h2 className="text-5xl text-center font-black text-neonAccent mb-4">Organization Settings</h2>
            <div className="mb-4">
                <label className="block text-white text-lg font-bold mb-2">Name:</label>
                <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-lightAccent text-white leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-white text-lg font-bold mb-2">Address:</label>
                <input
                    type="text"
                    value={orgAddress}
                    onChange={(e) => setOrgAddress(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-lightAccent text-white leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-white text-lg font-bold mb-2">Email:</label>
                <input
                    type="email"
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-lightAccent text-white leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-white text-lg font-bold mb-2">Type:</label>
                <input
                    type="text"
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-lightAccent text-white leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-white text-lg font-bold mb-2">Phone:</label>
                <input
                    type="text"
                    value={orgPhone}
                    onChange={(e) => setOrgPhone(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-lightAccent text-white leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-white text-lg font-bold mb-2">Description:</label>
                <textarea
                    value={orgDescription}
                    onChange={(e) => setOrgDescription(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-lightAccent text-white leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
                Save
            </button>
            {alertMessage && (
                <CustomAlert
                    message={alertMessage}
                    onClose={() => setAlertMessage(null)}
                />
            )}
        </div>
    );
};

export default OrgSettingsForm;