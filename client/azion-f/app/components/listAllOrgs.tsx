import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";

interface Organization {
  orgName: string;
  orgDescription: string;
  orgAddress: string;
  orgEmail:string;
  orgPhone: string;
  orgType: string;
}

const ListAllOrgs = () => {
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${apiUrl}/org/list/all`)
            .then(function (response: AxiosResponse) {
                console.log(response.data);
                setOrgs(response.data);
                setLoading(false);
            })
            .catch(function (error) {
                console.error(error.response ? error.response : error);
            });
    }, []);
    if(loading) {return <h2></h2>}

    if (orgs.length === 0&& !loading) {
        return <h2>No organizations to display</h2>
    }
    else {
        return (
            <div>
                {orgs.map((org, index) => (
                    <div key={index}>
                        <h2>{org.orgName}</h2>
                        <p>{org.orgDescription}</p>
                        <p>{org.orgAddress}</p>
                        <p>{org.orgEmail}</p>
                        <p>{org.orgPhone}</p>
                        <p>{org.orgType}</p>
                    </div>
                ))}
            </div>
        );
    }
};

export default ListAllOrgs;