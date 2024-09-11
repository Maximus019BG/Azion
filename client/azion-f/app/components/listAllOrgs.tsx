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
        console.log("Fetched data:", response.data);
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
    return <h2 className="text-white">Loading...</h2>;
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
    return <h2 className="text-white">No organizations to display</h2>;
  }

  return (
    <div className="w-[50vw]">
      {/* Grid container for responsive layout */}
      <div className="grid grid-cols-2 gap-6 lg:gap-8">
        {filteredOrgs.map((org, index) => (
          <div
            key={index}
            className="flex flex-col line-clamp-2 justify-start items-start p-6 bg-lightAccent rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <h2 className="text-white text-xl font-semibold mb-2">
              {org.orgName}
            </h2>
            <p className="text-white mb-1">{org.orgDescription}</p>
            <p className="text-white mb-1">{org.orgAddress}</p>
            <p className="text-white mb-1">{org.orgEmail}</p>
            <p className="text-white mb-1">{org.orgPhone}</p>
            <p className="text-white">{org.orgType}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListAllOrgs;
