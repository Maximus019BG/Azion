"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";

interface Organization {
  orgName: string;
  orgDescription: string;
  orgAddress: string;
  orgEmail: string;
  orgPhone: string;
  orgType: string;
}

interface ListAllOrgsProps {
  searchTerm: string;
}

const ListAllOrgs: React.FC<ListAllOrgsProps> = ({ searchTerm }) => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${apiUrl}/org/list/all`)
      .then((response: AxiosResponse) => {
        setOrgs(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error.response ? error.response : error);
        setOrgs([
          {
            orgName: "Org1",
            orgDescription: "Description1",
            orgAddress: "Address1",
            orgEmail: "email1@example.com",
            orgPhone: "123-456-7890",
            orgType: "Type1",
          },
          {
            orgName: "Org2",
            orgDescription: "Description2",
            orgAddress: "Address2",
            orgEmail: "email2@example.com",
            orgPhone: "987-654-3210",
            orgType: "Type2",
          },
        ]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center text-white">
        Loading...
      </div>
    );
  }

  const filteredOrgs = orgs.filter((org) =>
    [
      org.orgName,
      org.orgDescription,
      org.orgAddress,
      org.orgEmail,
      org.orgPhone,
      org.orgType,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (filteredOrgs.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center text-white">
        No organizations to display
      </div>
    );
  }

  return (
    //  Grid container for responsive layout
    <div className="flex gap-4 flex-wrap justify-center">
      {filteredOrgs.map((org, index) => (
        <div key={index} className="flex flex-col p-6 bg-gray-800 rounded-lg w-72">
          <h2 className="text-white text-lg md:text-xl font-semibold mb-3">
            {org.orgName}
          </h2>
          <p className="text-gray-300 mb-2">{org.orgDescription}</p>
          <p className="text-gray-300 mb-2">{org.orgAddress}</p>
          <p className="text-gray-300 mb-2">{org.orgEmail}</p>
          <p className="text-gray-300 mb-2">{org.orgPhone}</p>
          <p className="text-gray-300">{org.orgType}</p>
        </div>
      ))}
    </div>
  );
};

export default ListAllOrgs;