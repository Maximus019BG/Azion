import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";

interface Organization {
  id: number;
  name: string;
  description: string;
}

const ListAllOrgs = () => {
    const [orgs, setOrgs] = useState<Organization[]>([]);

    useEffect(() => {
        axios.get(`${apiUrl}/org/list/all`)
            .then(function (response: AxiosResponse) {
                console.log(response.data);
                setOrgs(response.data);
            })
            .catch(function (error) {
                console.error(error.response ? error.response : error);
            });
    }, []);
    if (orgs.length === 0) {
        return <h2>No organizations to display</h2>
    }
    else {
        return (
            <div>
                {orgs.map((org) => (
                    <div key={org.id}>
                        <h2>{org.name}</h2>
                        <p>{org.description}</p>
                    </div>
                ))}
            </div>
        );
    }
};

export default ListAllOrgs;