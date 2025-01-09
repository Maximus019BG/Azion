'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {apiUrl} from "@/app/api/config";
import Cookies from "js-cookie";

interface OrganizationPageProps {
    params: {
        conString: string;
    };
}

const OrganizationPage = ({ params }: OrganizationPageProps) => {
    const { conString } = params;
    const [organizationData, setOrganizationData] = useState(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");

        const data = {
            accessToken,
            refreshToken
        }

        const fetchOrganizationData = async () => {
            try {
                const response = await axios.put(`${apiUrl}/org/con/str/${conString}`, data, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                setOrganizationData(response.data);
            } catch (error) {
                console.error('Error fetching organization data:', error);
                setError('Unable to fetch organization details.');
            }
        };

        fetchOrganizationData();
    }, [conString]);

    if (error) {
        return (
            <div>
                <h1>Error</h1>
                <p>{error}</p>
            </div>
        );
    }

    if (!organizationData) {
        return (
            <div>
                <h1>Loading...</h1>
                <p>Please wait while we fetch the organization details.</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Organization Details</h1>
            <p>Connection String: {conString}</p>
            <pre>{JSON.stringify(organizationData, null, 2)}</pre>
        </div>
    );
};

export default OrganizationPage;
