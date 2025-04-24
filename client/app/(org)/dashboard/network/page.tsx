"use client"
import {useEffect, useState} from "react"
import Cookies from "js-cookie"
import axios from "axios"
import {sessionCheck, UserHasRight} from "@/app/func/funcs"
import {Card, CardContent} from "@/components/ui/card"
import {Loader2} from "lucide-react"
import {apiUrl} from "@/app/api/config"

// Format API response in a concise way
const formatApiResponse = (response: any) => {
    const site = response.data[0]
    const {meta, statistics} = site

    return (
        <div className="text-gray-200">
            <h3 className="text-lg font-bold mb-2">Site Information</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                    <strong>Site ID:</strong> {site.siteId}
                </div>
                <div>
                    <strong>Host ID:</strong> {site.hostId}
                </div>
                <div>
                    <strong>Name:</strong> {meta.name}
                </div>
                <div>
                    <strong>Timezone:</strong> {meta.timezone}
                </div>
            </div>

            <h3 className="text-lg font-bold mb-2">Statistics</h3>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <strong>Total Devices:</strong> {statistics.counts.totalDevice}
                </div>
                <div>
                    <strong>WiFi Clients:</strong> {statistics.counts.wifiClient}
                </div>
                <div>
                    <strong>Wired Clients:</strong> {statistics.counts.wiredClient}
                </div>
                <div>
                    <strong>WAN Uptime:</strong> {statistics.percentages.wanUptime}%
                </div>
            </div>
        </div>
    )
}

interface Network {
    id: string
    name: string
    description?: string
    siteId?: string
    hostId?: string
}

const NetworkCard = ({network, onClick}: { network: Network, onClick: () => void }) => {
    return (
        <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors duration-200" onClick={onClick}>
            <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-200">{network.name}</h3>
                {network.description && <p className="text-gray-400 mt-1">{network.description}</p>}
            </CardContent>
        </Card>
    )
}

const PageWithCustomDialog = () => {
    const [loading, setLoading] = useState(true)
    const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false)
    const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false)
    const [apiKey, setApiKey] = useState<string>("")
    const [apiResponse, setApiResponse] = useState<any>(null)
    const [networks, setNetworks] = useState<Network[]>([])

    // Fetch all networks on page load
    useEffect(() => {
        const checkSession = async () => {
            const refreshToken = Cookies.get("azionRefreshToken")
            const accessToken = Cookies.get("azionAccessToken")

            if (refreshToken && accessToken) {
                try {
                    await sessionCheck()
                    await UserHasRight("network")
                    setLoading(false)
                    fetchNetworks()
                } catch (error) {
                    console.error("Session check failed:", error)
                    window.location.href = "/login"
                }
            } else {
                window.location.href = "/login"
            }
        }

        checkSession()
    }, [])

    // Fetch all networks
    const fetchNetworks = async () => {
        try {
            const accessToken = Cookies.get("azionAccessToken")
            const response = await axios.get(`${apiUrl}/network/get/all`, {
                headers: {
                    authorization: accessToken,
                },
            })
            setNetworks(response.data)
        } catch (error) {
            console.error("Failed to fetch networks:", error)
        }
    }

    // Fetch API data from Unifi
    const fetchApiData = async (apiKey: string) => {
        try {
            const response = await axios.get("https://api.ui.com/ea/sites", {
                headers: {
                    "X-API-Key": apiKey,
                },
            })
            setApiResponse(response.data)
            setIsApiKeyDialogOpen(false)
            setIsResponseDialogOpen(true)
        } catch (error) {
            console.error("API request failed:", error)
            alert("Failed to fetch data from Unifi API")
        }
    }

    // Add network to database
    const addNetwork = async () => {
        try {
            if (!apiResponse || !apiResponse.data || apiResponse.data.length === 0) {
                return
            }

            const site = apiResponse.data[0]
            const accessToken = Cookies.get("azionAccessToken")

            const data = {
                name: site.meta.name || "Unifi Network",
                description: site.meta.desc || "Added from Unifi API",
                unifyApiKey: apiKey,
                siteId: site.siteId,
                hostId: site.hostId,
            }

            await axios.post(`${apiUrl}/network/add`, data, {
                headers: {
                    authorization: accessToken,
                },
            })

            // Refresh networks list and close dialog
            fetchNetworks()
            setIsResponseDialogOpen(false)
            alert("Network added successfully")
        } catch (error) {
            console.error("Failed to add network:", error)
            alert("Failed to add network")
        }
    }

    if (loading) {
        return (
            <div className="text-gray-200 bg-gray-950 h-screen flex items-center justify-center w-full">
                <Loader2 className="h-8 w-8 animate-spin mr-2"/>
                <span>Loading...</span>
            </div>
        )
    }

    const handleNetworkClick = (networkId: string) => {
        window.location.href = `/dashboard/network/view/${networkId}`
    }

    return (
        <div className="p-4 bg-gray-950 text-gray-200 min-h-dvh w-full">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Network Dashboard</h1>
                    <button
                        onClick={() => setIsApiKeyDialogOpen(true)}
                        className="bg-blue-800 hover:bg-blue-700 text-gray-100 px-4 py-2 rounded"
                    >
                        Add New Network
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {networks.map((network) => (
                        <NetworkCard key={network.id} network={network} onClick={() => handleNetworkClick(network.id)}/>
                    ))}

                    {networks.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-400">
                            No networks found. Click &quot;Add New Network&quot; to create one.
                        </div>
                    )}
                </div>
            </div>

            {/* API Key Input Dialog */}
            {isApiKeyDialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-4 text-gray-200">Enter Unifi API Key</h2>
                        <input
                            type="text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full p-2 border border-gray-700 rounded mb-4 bg-gray-800 text-gray-200"
                            placeholder="Enter API Key..."
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsApiKeyDialogOpen(false)}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => fetchApiData(apiKey)}
                                className="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-gray-200 rounded"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* API Response Dialog */}
            {isResponseDialogOpen && apiResponse && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-lg font-bold mb-4 text-gray-200">Network Information</h2>
                        <div
                            className="bg-gray-800 p-4 rounded mb-4 text-gray-200 cursor-pointer hover:bg-gray-700"
                            onClick={addNetwork}
                        >
                            {formatApiResponse(apiResponse)}
                            <p className="mt-4 text-sm text-blue-400 text-center">Click to add this network</p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsResponseDialogOpen(false)}
                                className="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-gray-200 rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PageWithCustomDialog
