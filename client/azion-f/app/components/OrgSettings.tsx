"use client";
import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '@/app/api/config';

const OrgSettingsForm = () => {
    const [orgName, setOrgName] = useState('');
    const [orgAddress, setOrgAddress] = useState('');
    const [orgEmail, setOrgEmail] = useState('');
    const [orgType, setOrgType] = useState('');
    const [orgPhone, setOrgPhone] = useState('');
    const [orgDescription, setOrgDescription] = useState('');

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
            alert('Organization details updated successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to update organization details');
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded">
            <h2 className="text-2xl font-bold mb-4">Organization Settings</h2>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Address</label>
                <input
                    type="text"
                    value={orgAddress}
                    onChange={(e) => setOrgAddress(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                    type="email"
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
                <input
                    type="text"
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
                <input
                    type="text"
                    value={orgPhone}
                    onChange={(e) => setOrgPhone(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                <textarea
                    value={orgDescription}
                    onChange={(e) => setOrgDescription(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>
            <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
                Save
            </button>
        </div>
    );
};

export default OrgSettingsForm;