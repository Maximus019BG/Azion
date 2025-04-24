"use client"
import type React from "react"
import {useEffect, useState} from "react"
import axios, {type AxiosResponse} from "axios"
import {Building2, Mail, MapPin, Phone, Tag} from "lucide-react"
import {motion} from "framer-motion"

// Update the import paths
// Replace these lines:
import {apiUrl} from "@/app/api/config"
import type {Organization} from "@/app/types/types"

interface ListAllOrgsProps {
    searchTerm: string
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
                setOrgs([
                    {
                        orgID: undefined,
                        orgName: "No organization data available",
                        orgDescription:
                            "We couldn't fetch the organization details. Please check your network connection or try again later.",
                        orgAddress: "Unavailable",
                        orgEmail: "Not Found",
                        orgPhone: "N/A",
                        orgType: "Unknown",
                    },
                ])
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <div className="w-full py-12 flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <div
                        className="w-12 h-12 rounded-full border-4 border-blue-400 border-t-transparent animate-spin mb-4"></div>
                    <p className="text-blue-300">Loading organizations...</p>
                </div>
            </div>
        )
    }

    const filteredOrgs = orgs.filter((org) =>
        [org.orgName, org.orgDescription, org.orgAddress, org.orgEmail, org.orgPhone, org.orgType]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
    )

    if (filteredOrgs.length === 0) {
        return (
            <div className="w-full py-16 flex justify-center items-center">
                <div className="text-center">
                    <div className="bg-blue-900/20 rounded-full p-6 inline-block mb-4">
                        <Building2 className="h-12 w-12 text-blue-400"/>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No organizations found</h3>
                    <p className="text-gray-400 max-w-md">
                        We couldn&lsquo;t find any organizations matching your search. Try adjusting your search terms.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredOrgs.map((org, index) => (
                <motion.div
                    key={index}
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.3, delay: index * 0.05}}
                    whileHover={{y: -5, transition: {duration: 0.2}}}
                    onClick={() => (window.location.href = `/organizations/view/${org.orgID}`)}
                    className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/30 rounded-lg overflow-hidden shadow-lg cursor-pointer group"
                >
                    <div
                        className="h-2 bg-gradient-to-r from-blue-600 to-blue-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2 group-hover:text-blue-300 transition-colors">
                            <Building2 className="text-blue-400 h-5 w-5 flex-shrink-0"/>
                            <span className="truncate">{org.orgName}</span>
                        </h2>

                        <div className="space-y-3 text-sm">
                            <p className="text-gray-300 line-clamp-2 mb-4">{org.orgDescription}</p>

                            <div className="flex items-start gap-2">
                                <MapPin className="text-blue-400 h-4 w-4 mt-0.5 flex-shrink-0"/>
                                <span className="text-gray-300 truncate">{org.orgAddress}</span>
                            </div>

                            <div className="flex items-start gap-2">
                                <Mail className="text-blue-400 h-4 w-4 mt-0.5 flex-shrink-0"/>
                                <span className="text-gray-300 truncate">{org.orgEmail}</span>
                            </div>

                            <div className="flex items-start gap-2">
                                <Phone className="text-blue-400 h-4 w-4 mt-0.5 flex-shrink-0"/>
                                <span className="text-gray-300 truncate">{org.orgPhone}</span>
                            </div>

                            <div className="flex items-start gap-2">
                                <Tag className="text-blue-400 h-4 w-4 mt-0.5 flex-shrink-0"/>
                                <span className="text-gray-300 truncate">{org.orgType}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-blue-900/30 flex justify-end">
              <span
                  className="text-blue-400 text-xs font-medium group-hover:translate-x-1 transition-transform duration-200 flex items-center gap-1">
                View details
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-arrow-right"
                >
                  <path d="M5 12h14"/>
                  <path d="m12 5 7 7-7 7"/>
                </svg>
              </span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

export default ListAllOrgs
