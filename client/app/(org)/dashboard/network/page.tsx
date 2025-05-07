"use client"
import {useEffect, useState} from "react"
import Cookies from "js-cookie"
import axios from "axios"
import {sessionCheck, UserHasRight} from "@/app/func/funcs"
import {Card, CardContent} from "@/components/ui/card"
import {AlertCircle, ChevronRight, ExternalLink, Loader2, Plus, Server, Wifi} from "lucide-react"
import {apiUrl} from "@/app/api/config"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {motion} from "framer-motion"
import {Badge} from "@/components/ui/badge"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"

// Format a single site from the API response
const formatSite = (site: any, index: number) => {
    const {meta, statistics} = site

    return (
        <div key={site.siteId || index} className="text-gray-200">
            <h3 className="text-lg font-bold mb-2 text-[#0ea5e9]">Site Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <div>
                    <strong className="text-gray-400">Site ID:</strong>{" "}
                    <span className="font-mono text-sm break-words">{site.siteId}</span>
                </div>
                <div>
                    <strong className="text-gray-400">Host ID:</strong>{" "}
                    <span className="font-mono text-sm break-words">{site.hostId}</span>
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
                className="h-full bg-gradient-to-br from-[#0a0a0a] to-[#111] border-[#222] hover:border-[#0ea5e9] cursor-pointer transition-colors duration-300 shadow-[0_0_15px_rgba(14,165,233,0.15)] hover:shadow-[0_0_25px_rgba(14,165,233,0.3)]"
                onClick={onClick}
            >
                <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-center mb-3">
                        <div className="mr-3 p-2 rounded-full bg-[#0c4a6e]/30 shadow-[0_0_10px_rgba(14,165,233,0.2)]">
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
    const [selectedSiteIndex, setSelectedSiteIndex] = useState<number>(0)

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
            setSelectedSiteIndex(0) // Reset to first site when new data is loaded
            setApiLoading(false)
        } catch (error) {
            console.error("API request failed:", error)
            setApiLoading(false)
            alert("Failed to fetch data from Unifi API")
        }
    }

    // Add network to database
    const addNetwork = async (siteIndex: number = selectedSiteIndex) => {
        try {
            if (!apiResponse || !apiResponse.data || apiResponse.data.length === 0) {
                return
            }

            const site = apiResponse.data[siteIndex]
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
                <div className="w-full flex flex-col items-center">
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
        <div className="p-4 md:p-6 lg:p-8  text-gray-200 min-h-dvh w-full">
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
                        <div
                            className="col-span-full bg-[#0a0a0a] border border-[#222] rounded-xl p-10 text-center shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                            <div className="flex flex-col items-center justify-center">
                                <div
                                    className="w-16 h-16 bg-[#0c4a6e]/30 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                                    <Wifi className="h-8 w-8 text-[#0ea5e9]"/>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No networks found</h3>
                                <p className="text-gray-400 max-w-md mx-auto mb-6">
                                    You haven&apos;t added any networks yet. Click &apos;Add New Network&apos; to
                                    connect your UniFi
                                    network.
                                </p>
                                <Button
                                    onClick={() => setIsApiKeyDialogOpen(true)}
                                    className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]"
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
                <DialogContent
                    className="bg-[#0a0a0a] border-[#222] text-white sm:max-w-md shadow-[0_0_30px_rgba(14,165,233,0.2)]">
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
                                className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white shadow-[0_0_10px_rgba(14,165,233,0.2)]"
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
                <DialogContent
                    className="bg-[#0a0a0a] border-[#222] text-white md:max-w-2xl w-[95vw] max-h-[90vh] overflow-auto shadow-[0_0_30px_rgba(14,165,233,0.2)]">
                    <DialogHeader>
                        <DialogTitle className="text-[#0ea5e9]">Network Information</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {apiResponse && apiResponse.data && apiResponse.data.length > 1
                                ? "Multiple networks found. Select a network to add."
                                : "Review and confirm the network details"}
                        </DialogDescription>
                    </DialogHeader>
                    {apiResponse && apiResponse.data && apiResponse.data.length > 0 ? (
                        <div className="py-4">
                            {apiResponse.data.length > 1 ? (
                                <Tabs defaultValue="list" className="w-full">
                                    <TabsList
                                        className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] grid grid-cols-2 mb-4">
                                        <TabsTrigger value="list">List View</TabsTrigger>
                                        <TabsTrigger value="detail">Detail View</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="list" className="space-y-4">
                                        <div className="grid gap-3">
                                            {apiResponse.data.map((site: any, index: number) => (
                                                <motion.div
                                                    key={site.siteId || index}
                                                    whileHover={{scale: 1.01}}
                                                    className={`bg-[#111] border ${
                                                        selectedSiteIndex === index ? "border-[#0ea5e9]" : "border-[#222]"
                                                    } rounded-lg p-3 cursor-pointer hover:bg-[#161616] transition-all duration-200 shadow-[0_0_10px_rgba(14,165,233,0.1)] hover:shadow-[0_0_15px_rgba(14,165,233,0.2)]`}
                                                    onClick={() => setSelectedSiteIndex(index)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="mr-3 p-1.5 rounded-full bg-[#0c4a6e]/30">
                                                                <Server className="h-4 w-4 text-[#0ea5e9]"/>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-medium text-white">{site.meta.name}</h3>
                                                                <div
                                                                    className="flex items-center text-xs text-gray-400 mt-1">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-[10px] h-4 mr-2 bg-[#0c4a6e]/20 border-[#0c4a6e]/50"
                                                                    >
                                                                        {site.statistics.counts.totalDevice} devices
                                                                    </Badge>
                                                                    <span
                                                                        className="text-[10px]">{site.meta.timezone}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 text-gray-500"/>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between pt-4 border-t border-[#222]">
                                            <div className="text-sm text-gray-400">
                                                Selected:{" "}
                                                <span
                                                    className="text-[#0ea5e9]">{apiResponse.data[selectedSiteIndex].meta.name}</span>
                                            </div>
                                            <Button
                                                onClick={() => addNetwork(selectedSiteIndex)}
                                                className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white"
                                            >
                                                <Plus className="h-4 w-4 mr-2"/>
                                                Add Network
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="detail">
                                        <div className="bg-[#111] border border-[#222] rounded-lg p-4 mb-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <Badge className="bg-[#0c4a6e] border-none">
                                                    Network {selectedSiteIndex + 1} of {apiResponse.data.length}
                                                </Badge>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedSiteIndex((prev) => (prev > 0 ? prev - 1 : prev))}
                                                        disabled={selectedSiteIndex === 0}
                                                        className="h-8 px-2 border-[#333] hover:border-[#0ea5e9] text-gray-300 hover:text-[#0ea5e9]"
                                                    >
                                                        Previous
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            setSelectedSiteIndex((prev) => (prev < apiResponse.data.length - 1 ? prev + 1 : prev))
                                                        }
                                                        disabled={selectedSiteIndex === apiResponse.data.length - 1}
                                                        className="h-8 px-2 border-[#333] hover:border-[#0ea5e9] text-gray-300 hover:text-[#0ea5e9]"
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
                                            </div>
                                            {formatSite(apiResponse.data[selectedSiteIndex], selectedSiteIndex)}
                                        </div>
                                        <div className="flex justify-end">
                                            <Button
                                                onClick={() => addNetwork(selectedSiteIndex)}
                                                className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white"
                                            >
                                                <Plus className="h-4 w-4 mr-2"/>
                                                Add This Network
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            ) : (
                                <>
                                    <div
                                        className="bg-[#111] border border-[#222] hover:border-[#0ea5e9] p-4 rounded-lg mb-4 text-gray-200 cursor-pointer hover:bg-[#161616] transition-all duration-200 shadow-[0_0_10px_rgba(14,165,233,0.1)] hover:shadow-[0_0_15px_rgba(14,165,233,0.2)]"
                                        onClick={() => addNetwork(0)}
                                    >
                                        {formatSite(apiResponse.data[0], 0)}
                                        <div className="mt-4 flex items-center justify-center text-sm text-[#0ea5e9]">
                                            <Plus className="h-4 w-4 mr-1"/>
                                            <span>Click to add this network</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            onClick={() => setIsResponseDialogOpen(false)}
                                            className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white shadow-[0_0_10px_rgba(14,165,233,0.2)]"
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4"/>
                            <h3 className="text-lg font-medium mb-2">No Networks Found</h3>
                            <p className="text-gray-400 mb-4">No network data was returned from the UniFi API.</p>
                            <Button
                                onClick={() => setIsResponseDialogOpen(false)}
                                className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white"
                            >
                                Close
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PageWithCustomDialog
