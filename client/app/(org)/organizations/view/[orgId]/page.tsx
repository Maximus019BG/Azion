"use client"
import {useEffect, useState} from "react"
import axios from "axios"
import {useParams} from "next/navigation"
import {Card, CardContent} from "@/components/ui/card"
import {Building2, Mail, MapPin, Phone, Tag} from "lucide-react"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {Organization} from "@/app/types/types"
import {apiUrl} from "@/app/api/config";

export default function OrganizationPage() {
    const params = useParams()
    const orgId = params.orgId as string
    const [organization, setOrganization] = useState<Organization | undefined>(undefined);

    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                const response = await axios.get<Organization>(`${apiUrl}/org/get/${orgId}`)
                if (response?.data) {
                    setOrganization(response.data)
                }
            } catch (err) {
                console.error("Error fetching organization:", err)
            }
        }

        if (orgId) {
            fetchOrganization()
        }
    }, [orgId])

    if (!organization) {
        return <div>Loading...</div>; // or a skeleton/loading spinner
    }

    return (
        <div className="min-h-screen bg-[#0d0e0d] text-white py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{organization.orgName}</h1>
                    <div className="mt-2">
                        <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">
                            {organization.orgType}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 bg-zinc-900/50 border-zinc-800 text-white shadow-xl">
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold flex items-center gap-2 mb-3 text-zinc-100">
                                        <Building2 className="h-5 w-5 text-emerald-400"/>
                                        About
                                    </h2>
                                    <p className="text-zinc-300 leading-relaxed">{organization.orgDescription}</p>
                                </div>

                                <Separator className="bg-zinc-800"/>

                                <div>
                                    <h2 className="text-xl font-semibold flex items-center gap-2 mb-3 text-zinc-100">
                                        <MapPin className="h-5 w-5 text-emerald-400"/>
                                        Location
                                    </h2>
                                    <p className="text-zinc-300">{organization.orgAddress}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900/50 border-zinc-800 text-white shadow-xl h-fit">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold mb-4 text-zinc-100">Contact Information</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 text-emerald-400 mt-0.5"/>
                                    <div>
                                        <p className="text-sm text-zinc-400">Email</p>
                                        <p className="text-zinc-200">{organization.orgEmail}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-emerald-400 mt-0.5"/>
                                    <div>
                                        <p className="text-sm text-zinc-400">Phone</p>
                                        <p className="text-zinc-200">{organization.orgPhone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Tag className="h-5 w-5 text-emerald-400 mt-0.5"/>
                                    <div>
                                        <p className="text-sm text-zinc-400">Type</p>
                                        <p className="text-zinc-200">{organization.orgType}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
