"use client";
import type React from "react"
import {useEffect, useState} from "react"
import axios, {type AxiosResponse} from "axios"
import {apiUrl} from "../api/config"
import {MdCategory, MdDescription, MdEmail, MdLocationOn, MdPhone, MdTitle} from "react-icons/md"
import {TbMilitaryRankFilled} from "react-icons/tb"
import {CgOrganisation} from "react-icons/cg"

interface Organization {
    orgName: string
    orgDescription: string
    orgAddress: string
    orgEmail: string
    orgPhone: string
    orgType: string
}

interface ListAllOrgsProps {
    searchTerm: string
}

const ListAllOrgs: React.FC<ListAllOrgsProps> = ({searchTerm}) => {
    const [orgs, setOrgs] = useState<Organization[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios
            .get(`${apiUrl}/org/list/all`)
            .then((response: AxiosResponse) => {
                setOrgs(response.data)
                setLoading(false)
            })
            .catch((error) => {
                console.error(error.response ? error.response : error)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return <div className="w-full h-full flex justify-center items-center text-white">Loading...</div>
    }

    const filteredOrgs = orgs.filter((org) =>
        [org.orgName, org.orgDescription, org.orgAddress, org.orgEmail, org.orgPhone, org.orgType]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
    )

    if (filteredOrgs.length === 0) {
        return <div className="w-full h-full flex justify-center items-center text-white">No organizations to
            display</div>
    }

    return (
        <div className="w-full h-full flex gap-6 flex-wrap justify-center p-4">
            {filteredOrgs.map((org, index) => (
                <div
                    key={index}
                    className="flex flex-col justify-start items-start gap-4 p-6 bg-base-200 rounded-lg w-96 shadow-lg transform transition-transform hover:scale-105 hover:shadow-2xl"
                >
                    <h2 className="text-white text-lg md:text-xl font-semibold mb-3 flex items-center gap-3">
                        <CgOrganisation className="text-teal-400 text-2xl"/>
                        {org.orgName}
                    </h2>
                    <p className="text-gray-300 flex justify-start items-center gap-3">
                        <MdDescription className="text-blue-400 text-xl"/> {org.orgDescription}
                    </p>
                    <p className="text-gray-300 flex justify-start items-center gap-3">
                        <MdLocationOn className="text-red-400 text-xl"/> {org.orgAddress}
                    </p>
                    <p className="text-gray-300 flex justify-start items-center gap-3">
                        <MdEmail className="text-amber-400 text-xl"/> {org.orgEmail}
                    </p>
                    <p className="text-gray-300 flex justify-start items-center gap-3">
                        <MdPhone className="text-green-400 text-xl"/> {org.orgPhone}
                    </p>
                    <p className="text-gray-300 flex justify-start items-center gap-3">
                        <TbMilitaryRankFilled className="text-orange-400 text-xl"/> {org.orgType}
                    </p>
                </div>
            ))}
        </div>
    )
}

export default ListAllOrgs

