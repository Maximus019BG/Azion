"use client"
import {useEffect, useState} from "react"
import Cookies from "js-cookie"
import axios from "axios"
import {sessionCheck, UserHasRight} from "@/app/func/funcs"
import {Card, CardContent} from "@/components/ui/card"
import {ExternalLink, Loader2, Plus, Server, Wifi} from "lucide-react"
import {apiUrl} from "@/app/api/config"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {motion} from "framer-motion"

// Format API response in a concise way
const formatApiResponse = (response: any) => {
    const site = response.data[0]
    const {meta, statistics} = site

    return (
        <div className="text-gray-200">
            <h3 className="text-lg font-bold mb-2 text-[#0ea5e9]">Site Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <div>
                    <strong className="text-gray-400">Site ID:</strong> <span
                    className="font-mono text-sm">{site.siteId}</span>
                </div>
                <div>
                    <strong className="text-gray-400">Host ID:</strong> <span
                    className="font-mono text-sm">{site.hostId}</span>
                </div>
                <div>
                    <strong className="text-gray-400">Name:</strong> {meta.name}
                </div>
                <div>
                    <strong className="text-gray-400">Timezone:</strong> {meta.timezone}
                </div>
            </div>

            <h3 className="text-lg font-bold mb-2 text-[#0ea5e9]">Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                    <strong className="text-gray-400">Total Devices:</strong> {statistics.counts.totalDevice}
                </div>
                <div>
                    <strong className="text-gray-400">WiFi Clients:</strong> {statistics.counts.wifiClient}
                </div>
                <div>
                    <strong className="text-gray-400">Wired Clients:</strong> {statistics.counts.wiredClient}
                </div>
                <div>
                    <strong className="text-gray-400">WAN Uptime:</strong>{" "}
                    <span className={statistics.percentages.wanUptime > 99 ? "text-green-400" : "text-yellow-400"}>
            {statistics.percentages.wanUptime}%
          </span>
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

const NetworkCard = ({network, onClick}: { network: Network; onClick: () => void }) => {
    return (
        <motion.div whileHover={{scale: 1.02}} transition={{type: "spring", stiffness: 300}} className="h-full">
            <Card
                className="h-full bg-gradient-to-br from-[#0a0a0a] to-[#111] border-[#222] hover:border-[#0ea5e9] cursor-pointer transition-colors duration-300 shadow-md hover:shadow-[0_0_15px_rgba(14,165,233,0.15)]"
                onClick={onClick}
            >
                <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-center mb-3">
                        <div className="mr-3 p-2 rounded-full bg-[#0c4a6e]/30">
                            <Server className="h-5 w-5 text-[#0ea5e9]"/>
                        </div>
                        <h3 className="text-lg font-semibold text-white">{network.name}</h3>
                    </div>
                    {network.description &&
                        <p className="text-gray-400 text-sm mb-3 flex-grow">{network.description}</p>}
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <div className="flex items-center">
                            <Wifi className="h-3 w-3 mr-1"/>
                            <span>{network.siteId ? "Connected" : "Status unknown"}</span>
                        </div>
                        <div className="flex items-center text-[#0ea5e9]">
                            <span>View details</span>
                            <ExternalLink className="h-3 w-3 ml-1"/>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

const PageWithCustomDialog = () => {
    const [loading, setLoading] = useState(true)
    const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false)
    const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false)
    const [apiKey, setApiKey] = useState<string>("")
    const [apiResponse, setApiResponse] = useState<any>(null)
    const [networks, setNetworks] = useState<Network[]>([])
    const [apiLoading, setApiLoading] = useState(false)

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
            setApiLoading(true)
            const response = await axios.get("https://api.ui.com/ea/sites", {
                headers: {
                    "X-API-Key": apiKey,
                },
            })
            setApiResponse(response.data)
            setIsApiKeyDialogOpen(false)
            setIsResponseDialogOpen(true)
            setApiLoading(false)
        } catch (error) {
            console.error("API request failed:", error)
            setApiLoading(false)
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
            <div
                className="text-gray-200 bg-gradient-to-br from-[#050505] to-[#0c0c0c] h-screen flex items-center justify-center w-full">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-[#0ea5e9] mb-4"/>
                    <span className="text-gray-400">Loading network dashboard...</span>
                </div>
            </div>
        )
    }

    const handleNetworkClick = (networkId: string) => {
        window.location.href = `/dashboard/network/view/${networkId}`
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-[#050505] to-[#0c0c0c] text-gray-200 min-h-dvh w-full">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent">
                            Network Dashboard
                        </h1>
                        <p className="text-gray-400 mt-1">Manage and monitor your UniFi networks</p>
                    </div>
                    <Button
                        onClick={() => setIsApiKeyDialogOpen(true)}
                        className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)]"
                    >
                        <Plus className="h-4 w-4 mr-2"/>
                        Add New Network
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {networks.map((network) => (
                        <NetworkCard key={network.id} network={network} onClick={() => handleNetworkClick(network.id)}/>
                    ))}

                    {networks.length === 0 && (
                        <div className="col-span-full bg-[#0a0a0a] border border-[#222] rounded-xl p-10 text-center">
                            <div className="flex flex-col items-center justify-center">
                                <div
                                    className="w-16 h-16 bg-[#0c4a6e]/30 rounded-full flex items-center justify-center mb-4">
                                    <Wifi className="h-8 w-8 text-[#0ea5e9]"/>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No networks found</h3>
                                <p className="text-gray-400 max-w-md mx-auto mb-6">
                                    You haven't added any networks yet. Click "Add New Network" to connect your UniFi
                                    network.
                                </p>
                                <Button
                                    onClick={() => setIsApiKeyDialogOpen(true)}
                                    className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white"
                                >
                                    <Plus className="h-4 w-4 mr-2"/>
                                    Add New Network
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* API Key Input Dialog */}
            <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
                <DialogContent className="bg-[#0a0a0a] border-[#222] text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[#0ea5e9]">Enter UniFi API Key</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Provide your UniFi API key to connect to your network
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="bg-[#111] border-[#333] focus:border-[#0ea5e9] text-white"
                                placeholder="Enter API Key..."
                            />
                            <p className="text-xs text-gray-500">
                                You can find your API key in the UniFi Network application under Settings &gt; API
                                Access
                            </p>
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsApiKeyDialogOpen(false)}
                                className="border-[#333] hover:border-[#0ea5e9] text-gray-300 hover:text-[#0ea5e9]"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => fetchApiData(apiKey)}
                                disabled={!apiKey.trim() || apiLoading}
                                className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white"
                            >
                                {apiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                                {apiLoading ? "Connecting..." : "Connect"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* API Response Dialog */}
            <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
                <DialogContent className="bg-[#0a0a0a] border-[#222] text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[#0ea5e9]">Network Information</DialogTitle>
                        <DialogDescription className="text-gray-400">Review and confirm the network
                            details</DialogDescription>
                    </DialogHeader>
                    {apiResponse && (
                        <div className="py-4">
                            <div
                                className="bg-[#111] border border-[#222] hover:border-[#0ea5e9] p-4 rounded-lg mb-4 text-gray-200 cursor-pointer hover:bg-[#161616] transition-all duration-200"
                                onClick={addNetwork}
                            >
                                {formatApiResponse(apiResponse)}
                                <div className="mt-4 flex items-center justify-center text-sm text-[#0ea5e9]">
                                    <Plus className="h-4 w-4 mr-1"/>
                                    <span>Click to add this network</span>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    onClick={() => setIsResponseDialogOpen(false)}
                                    className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PageWithCustomDialog
