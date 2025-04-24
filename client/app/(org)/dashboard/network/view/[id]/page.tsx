"use client"

import {useEffect, useState} from "react"
import {useParams} from "next/navigation"
import axios from "axios"
import Cookies from "js-cookie"
import {sessionCheck, UserHasRight} from "@/app/func/funcs"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs"
// @ts-ignore
import {Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis,} from "recharts"
import {ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart"
import {Activity, AlertCircle, ArrowDown, ArrowLeft, ArrowUp, Clock, Gauge, Loader2, RefreshCw, Server, Wifi, WifiOff,} from "lucide-react"
import {format} from "date-fns"
import {apiUrl} from "@/app/api/config"
import {Button} from "@/components/ui/button"
import Link from "next/link"
import {motion} from "framer-motion"

// Define types for our data
interface WanData {
    avgLatency: number
    download_kbps: number
    downtime: number
    ispAsn: string
    ispName: string
    maxLatency: number
    packetLoss: number
    upload_kbps: number
    uptime: number
}

interface Period {
    data: {
        wan: WanData
    }
    metricTime: string
    version: string
}

interface Metric {
    metricType: string
    periods: Period[]
    hostId: string
    siteId: string
}

interface NetworkData {
    data: {
        metrics: Metric[]
    }
    httpStatusCode: number
    traceId: string
}

// Format data for charts
const formatChartData = (periods: Period[]) => {
    return periods.map((period) => {
        const date = new Date(period.metricTime)
        return {
            time: format(date, "HH:mm"),
            date: format(date, "MMM dd"),
            avgLatency: period.data.wan.avgLatency,
            maxLatency: period.data.wan.maxLatency,
            download: period.data.wan.download_kbps / 1000, // Convert to Mbps
            upload: period.data.wan.upload_kbps / 1000, // Convert to Mbps
            packetLoss: period.data.wan.packetLoss,
            uptime: period.data.wan.uptime,
        }
    })
}

// Calculate average values
const calculateAverages = (periods: Period[]) => {
    const total = periods.reduce(
        (acc, period) => {
            acc.avgLatency += period.data.wan.avgLatency
            acc.maxLatency += period.data.wan.maxLatency
            acc.download += period.data.wan.download_kbps
            acc.upload += period.data.wan.upload_kbps
            acc.packetLoss += period.data.wan.packetLoss
            acc.uptime += period.data.wan.uptime
            return acc
        },
        {
            avgLatency: 0,
            maxLatency: 0,
            download: 0,
            upload: 0,
            packetLoss: 0,
            uptime: 0,
        },
    )

    const count = periods.length
    return {
        avgLatency: (total.avgLatency / count).toFixed(1),
        maxLatency: (total.maxLatency / count).toFixed(1),
        download: (total.download / count / 1000).toFixed(0), // Convert to Mbps
        upload: (total.upload / count / 1000).toFixed(0), // Convert to Mbps
        packetLoss: (total.packetLoss / count).toFixed(2),
        uptime: (total.uptime / count).toFixed(2),
        ispName: periods[0]?.data.wan.ispName || "Unknown",
    }
}

// Find anomalies in the data
const findAnomalies = (periods: Period[]) => {
    const anomalies = []

    // Find periods with packet loss
    const packetLossEvents = periods.filter((period) => period.data.wan.packetLoss > 0)
    if (packetLossEvents.length > 0) {
        anomalies.push({
            type: "Packet Loss",
            count: packetLossEvents.length,
            events: packetLossEvents.map((p) => ({
                time: format(new Date(p.metricTime), "MMM dd, HH:mm"),
                value: p.data.wan.packetLoss,
            })),
        })
    }

    // Find periods with downtime
    const downtimeEvents = periods.filter((period) => period.data.wan.downtime > 0)
    if (downtimeEvents.length > 0) {
        anomalies.push({
            type: "Downtime",
            count: downtimeEvents.length,
            events: downtimeEvents.map((p) => ({
                time: format(new Date(p.metricTime), "MMM dd, HH:mm"),
                value: p.data.wan.downtime,
            })),
        })
    }

    // Find periods with high latency (> 20ms)
    const highLatencyEvents = periods.filter((period) => period.data.wan.maxLatency > 30)
    if (highLatencyEvents.length > 0) {
        anomalies.push({
            type: "High Latency",
            count: highLatencyEvents.length,
            events: highLatencyEvents.map((p) => ({
                time: format(new Date(p.metricTime), "MMM dd, HH:mm"),
                value: p.data.wan.maxLatency,
            })),
        })
    }

    return anomalies
}

export default function NetworkDetailPage() {
    const params = useParams()
    const networkId = params.id as string

    const [loading, setLoading] = useState(true)
    const [networkData, setNetworkData] = useState<NetworkData | null>(null)
    const [chartData, setChartData] = useState<any[]>([])
    const [averages, setAverages] = useState<any>(null)
    const [anomalies, setAnomalies] = useState<any[]>([])
    const [timeRange, setTimeRange] = useState("24h")
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        const checkSession = async () => {
            const refreshToken = Cookies.get("azionRefreshToken")
            const accessToken = Cookies.get("azionAccessToken")

            if (refreshToken && accessToken) {
                try {
                    await sessionCheck()
                    await UserHasRight("network")
                    fetchNetworkData()
                } catch (error) {
                    console.error("Session check failed:", error)
                    window.location.href = "/login"
                }
            } else {
                window.location.href = "/login"
            }
        }

        checkSession()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [networkId])

    const fetchNetworkData = async () => {
        try {
            setRefreshing(true)
            const accessToken = Cookies.get("azionAccessToken")
            const response = await axios.get(`${apiUrl}/network/get/${networkId}`, {
                headers: {
                    authorization: `${accessToken}`,
                },
            })

            setNetworkData(response.data)

            if (response.data?.data?.metrics?.[0]?.periods) {
                const periods = response.data.data.metrics[0].periods

                // Filter data based on selected time range
                let filteredPeriods = periods
                if (timeRange === "24h") {
                    filteredPeriods = periods.slice(-24)
                } else if (timeRange === "7d") {
                    filteredPeriods = periods.slice(-168) // 7 days * 24 hours
                }

                const formattedData = formatChartData(filteredPeriods)
                setChartData(formattedData)
                setAverages(calculateAverages(filteredPeriods))
                setAnomalies(findAnomalies(filteredPeriods))
            }

            setLoading(false)
            setRefreshing(false)
        } catch (error) {
            console.error("Failed to fetch network data:", error)
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleTimeRangeChange = (range: string) => {
        setTimeRange(range)

        if (networkData?.data?.metrics?.[0]?.periods) {
            const periods = networkData.data.metrics[0].periods

            // Filter data based on selected time range
            let filteredPeriods = periods
            if (range === "24h") {
                filteredPeriods = periods.slice(-24)
            } else if (range === "7d") {
                filteredPeriods = periods.slice(-168) // 7 days * 24 hours
            } else if (range === "30d") {
                filteredPeriods = periods // All data (approximately 30 days)
            }

            const formattedData = formatChartData(filteredPeriods)
            setChartData(formattedData)
            setAverages(calculateAverages(filteredPeriods))
            setAnomalies(findAnomalies(filteredPeriods))
        }
    }

    type Formatter<ValueType = number | string, NameType = string> = (
        value: ValueType,
        name: NameType,
        props: any
    ) => React.ReactNode

    const formatPercentage: Formatter = (value) => `${value}%`
    const formatSpeed: Formatter = (value) => `${value} Mbps`
    const formatLatency: Formatter = (value) => `${value} ms`

    if (loading) {
        return (
            <div
                className="w-full flex items-center justify-center h-screen bg-gradient-to-br from-[#050505] to-[#0c0c0c]">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-[#0ea5e9] mb-4"/>
                    <span className="text-gray-400">Loading network data...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-dvh w-full bg-gradient-to-br from-[#050505] to-[#0c0c0c] text-gray-100 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <div className="flex items-center mb-1">
                            <Link href="/dashboard/network">
                                <Button variant="ghost" size="sm"
                                        className="mr-2 text-gray-400 hover:text-[#0ea5e9] -ml-2 h-8 w-8">
                                    <ArrowLeft className="h-4 w-4"/>
                                    <span className="sr-only">Back</span>
                                </Button>
                            </Link>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent">
                                Network Monitoring
                            </h1>
                        </div>
                        <p className="text-gray-400">
                            Detailed metrics for network {networkId}
                            {averages && ` - ${averages.ispName}`}
                        </p>
                    </div>

                    <Button
                        onClick={fetchNetworkData}
                        disabled={refreshing}
                        className="bg-[#111] border border-[#333] hover:border-[#0ea5e9] text-gray-300 hover:text-[#0ea5e9]"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}/>
                        {refreshing ? "Refreshing..." : "Refresh Data"}
                    </Button>
                </div>

                {/* Time Range Selector */}
                <div className="mb-6">
                    <Tabs defaultValue="24h" value={timeRange} onValueChange={handleTimeRangeChange} className="w-full">
                        <TabsList className="bg-[#111] border border-[#222] p-1 h-auto">
                            <TabsTrigger
                                value="24h"
                                className="data-[state=active]:bg-[#0c4a6e] data-[state=active]:text-white px-4 py-2"
                            >
                                Last 24 Hours
                            </TabsTrigger>
                            <TabsTrigger
                                value="7d"
                                className="data-[state=active]:bg-[#0c4a6e] data-[state=active]:text-white px-4 py-2"
                            >
                                Last 7 Days
                            </TabsTrigger>
                            <TabsTrigger
                                value="30d"
                                className="data-[state=active]:bg-[#0c4a6e] data-[state=active]:text-white px-4 py-2"
                            >
                                Last 30 Days
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Summary Cards */}
                {averages && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                                    transition={{delay: 0.1}}>
                            <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border-[#222] overflow-hidden">
                                <CardHeader className="pb-2 bg-[#0c4a6e]/10">
                                    <CardDescription className="text-gray-400">Average Latency</CardDescription>
                                    <CardTitle className="text-2xl flex items-center">
                                        <Clock className="mr-2 h-5 w-5 text-[#0ea5e9]"/>
                                        {averages.avgLatency} ms
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <p className="text-sm text-gray-400">Max: {averages.maxLatency} ms</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                                    transition={{delay: 0.2}}>
                            <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border-[#222] overflow-hidden">
                                <CardHeader className="pb-2 bg-[#0c4a6e]/10">
                                    <CardDescription className="text-gray-400">Download Speed</CardDescription>
                                    <CardTitle className="text-2xl flex items-center">
                                        <ArrowDown className="mr-2 h-5 w-5 text-[#0ea5e9]"/>
                                        {averages.download} Mbps
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="flex items-center">
                                        <ArrowUp className="mr-1 h-4 w-4 text-gray-400"/>
                                        <p className="text-sm text-gray-400">Upload: {averages.upload} Mbps</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                                    transition={{delay: 0.3}}>
                            <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border-[#222] overflow-hidden">
                                <CardHeader className="pb-2 bg-[#0c4a6e]/10">
                                    <CardDescription className="text-gray-400">Packet Loss</CardDescription>
                                    <CardTitle className="text-2xl flex items-center">
                                        <Activity className="mr-2 h-5 w-5 text-[#0ea5e9]"/>
                                        {averages.packetLoss}%
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <p className="text-sm text-gray-400">
                                        {Number(averages.packetLoss) > 0 ? "Some packet loss detected" : "No packet loss detected"}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                                    transition={{delay: 0.4}}>
                            <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border-[#222] overflow-hidden">
                                <CardHeader className="pb-2 bg-[#0c4a6e]/10">
                                    <CardDescription className="text-gray-400">Uptime</CardDescription>
                                    <CardTitle className="text-2xl flex items-center">
                                        <Wifi className="mr-2 h-5 w-5 text-[#0ea5e9]"/>
                                        {averages.uptime}%
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <p className="text-sm text-gray-400">
                                        {Number(averages.uptime) === 100
                                            ? "Perfect uptime"
                                            : `${(100 - Number(averages.uptime)).toFixed(2)}% downtime`}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Latency Chart */}
                    <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.5}}>
                        <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border-[#222]">
                            <CardHeader>
                                <CardTitle className="text-[#0ea5e9]">Latency</CardTitle>
                                <CardDescription className="text-gray-400">Average and maximum latency over
                                    time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ChartContainer
                                        config={{
                                            avgLatency: {
                                                label: "Avg Latency",
                                                color: "#0ea5e9",
                                            },
                                            maxLatency: {
                                                label: "Max Latency",
                                                color: "#f97316",
                                            },
                                        }}
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData}
                                                       margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)"/>
                                                <XAxis
                                                    dataKey="time"
                                                    stroke="rgba(255, 255, 255, 0.5)"
                                                    tickFormatter={(value, index) => {
                                                        // Show fewer ticks for readability
                                                        return index % Math.ceil(chartData.length / 12) === 0 ? value : ""
                                                    }}
                                                />
                                                <YAxis stroke="rgba(255, 255, 255, 0.5)"/>
                                                <ChartTooltip content={<ChartTooltipContent indicator="line"
                                                                                            formatter={formatLatency}/>}/>
                                                <Line
                                                    type="monotone"
                                                    dataKey="avgLatency"
                                                    stroke="#0ea5e9"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{r: 4}}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="maxLatency"
                                                    stroke="#f97316"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{r: 4}}
                                                />
                                                <ChartLegend/>
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Speed Chart */}
                    <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.6}}>
                        <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border-[#222]">
                            <CardHeader>
                                <CardTitle className="text-[#0ea5e9]">Network Speed</CardTitle>
                                <CardDescription className="text-gray-400">Download and upload speeds over
                                    time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ChartContainer
                                        config={{
                                            download: {
                                                label: "Download",
                                                color: "#0ea5e9",
                                            },
                                            upload: {
                                                label: "Upload",
                                                color: "#8b5cf6",
                                            },
                                        }}
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData}
                                                       margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)"/>
                                                <XAxis
                                                    dataKey="time"
                                                    stroke="rgba(255, 255, 255, 0.5)"
                                                    tickFormatter={(value, index) => {
                                                        return index % Math.ceil(chartData.length / 12) === 0 ? value : ""
                                                    }}
                                                />
                                                <YAxis stroke="rgba(255, 255, 255, 0.5)"/>
                                                <ChartTooltip content={<ChartTooltipContent indicator="dot"
                                                                                            formatter={formatSpeed}/>}/>
                                                <Area
                                                    type="monotone"
                                                    dataKey="download"
                                                    stroke="#0ea5e9"
                                                    fill="rgba(14, 165, 233, 0.2)"
                                                    strokeWidth={2}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="upload"
                                                    stroke="#8b5cf6"
                                                    fill="rgba(139, 92, 246, 0.2)"
                                                    strokeWidth={2}
                                                />
                                                <ChartLegend/>
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Packet Loss Chart */}
                    <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.7}}>
                        <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border-[#222]">
                            <CardHeader>
                                <CardTitle className="text-[#0ea5e9]">Packet Loss</CardTitle>
                                <CardDescription className="text-gray-400">Packet loss percentage over
                                    time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ChartContainer
                                        config={{
                                            packetLoss: {
                                                label: "Packet Loss",
                                                color: "#eab308",
                                            },
                                        }}
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData}
                                                      margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)"/>
                                                <XAxis
                                                    dataKey="time"
                                                    stroke="rgba(255, 255, 255, 0.5)"
                                                    tickFormatter={(value, index) => {
                                                        return index % Math.ceil(chartData.length / 12) === 0 ? value : ""
                                                    }}
                                                />
                                                <YAxis stroke="rgba(255, 255, 255, 0.5)"/>
                                                <ChartTooltip content={<ChartTooltipContent indicator="dot"
                                                                                            formatter={formatPercentage}/>}/>
                                                <Bar dataKey="packetLoss" fill="#eab308" radius={[4, 4, 0, 0]}/>
                                                <ChartLegend/>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Uptime Chart */}
                    <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.8}}>
                        <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border-[#222]">
                            <CardHeader>
                                <CardTitle className="text-[#0ea5e9]">Network Uptime</CardTitle>
                                <CardDescription className="text-gray-400">Uptime percentage over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ChartContainer
                                        config={{
                                            uptime: {
                                                label: "Uptime",
                                                color: "#0ea5e9",
                                            },
                                        }}
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData}
                                                       margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)"/>
                                                <XAxis
                                                    dataKey="time"
                                                    stroke="rgba(255, 255, 255, 0.5)"
                                                    tickFormatter={(value, index) => {
                                                        return index % Math.ceil(chartData.length / 12) === 0 ? value : ""
                                                    }}
                                                />
                                                <YAxis domain={[95, 100]} stroke="rgba(255, 255, 255, 0.5)"/>
                                                <ChartTooltip content={<ChartTooltipContent indicator="line"
                                                                                            formatter={formatPercentage}/>}/>
                                                <Line
                                                    type="monotone"
                                                    dataKey="uptime"
                                                    stroke="#0ea5e9"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{r: 4}}
                                                />
                                                <ChartLegend/>
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Anomalies Section */}
                {anomalies.length > 0 && (
                    <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.9}}>
                        <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border-[#222] mb-6">
                            <CardHeader>
                                <CardTitle className="text-[#0ea5e9] flex items-center">
                                    <AlertCircle className="h-5 w-5 mr-2 text-yellow-500"/>
                                    Network Anomalies
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Detected issues during the selected time period
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {anomalies.map((anomaly, index) => (
                                        <div key={index} className="border border-[#222] rounded-lg p-4 bg-[#111]">
                                            <h3 className="text-lg font-medium mb-2 flex items-center">
                                                {anomaly.type === "Packet Loss" &&
                                                    <Activity className="mr-2 h-5 w-5 text-yellow-400"/>}
                                                {anomaly.type === "Downtime" &&
                                                    <WifiOff className="mr-2 h-5 w-5 text-red-400"/>}
                                                {anomaly.type === "High Latency" &&
                                                    <Gauge className="mr-2 h-5 w-5 text-orange-400"/>}
                                                {anomaly.type} ({anomaly.count} events)
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                {anomaly.events.slice(0, 6).map((event: any, eventIndex: number) => (
                                                    <div
                                                        key={eventIndex}
                                                        className="bg-[#0a0a0a] p-2 rounded text-sm border border-[#222] hover:border-[#333]"
                                                    >
                                                        <span className="text-gray-400">{event.time}:</span>{" "}
                                                        {anomaly.type === "Packet Loss" && `${event.value}% loss`}
                                                        {anomaly.type === "Downtime" && `${event.value} seconds`}
                                                        {anomaly.type === "High Latency" && `${event.value}ms`}
                                                    </div>
                                                ))}
                                                {anomaly.events.length > 6 && (
                                                    <div
                                                        className="bg-[#0a0a0a] p-2 rounded text-sm text-gray-400 border border-[#222]">
                                                        +{anomaly.events.length - 6} more events...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Network Details */}
                <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 1.0}}>
                    <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border-[#222]">
                        <CardHeader>
                            <CardTitle className="text-[#0ea5e9] flex items-center">
                                <Server className="h-5 w-5 mr-2"/>
                                Network Details
                            </CardTitle>
                            <CardDescription className="text-gray-400">Technical information about this
                                network</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-[#111] p-3 rounded-lg border border-[#222]">
                                    <h3 className="text-sm font-medium text-[#0ea5e9] mb-1">Site ID</h3>
                                    <p className="text-gray-200 font-mono text-sm">{networkData?.data?.metrics?.[0]?.siteId || "N/A"}</p>
                                </div>
                                <div className="bg-[#111] p-3 rounded-lg border border-[#222]">
                                    <h3 className="text-sm font-medium text-[#0ea5e9] mb-1">Host ID</h3>
                                    <p className="text-gray-200 font-mono text-sm break-words">{networkData?.data?.metrics?.[0]?.hostId || "N/A"}</p>
                                </div>
                                <div className="bg-[#111] p-3 rounded-lg border border-[#222]">
                                    <h3 className="text-sm font-medium text-[#0ea5e9] mb-1">ISP</h3>
                                    <p className="text-gray-200">{chartData[0]?.ispName || "N/A"}</p>
                                </div>
                                <div className="bg-[#111] p-3 rounded-lg border border-[#222]">
                                    <h3 className="text-sm font-medium text-[#0ea5e9] mb-1">ASN</h3>
                                    <p className="text-gray-200">
                                        {networkData?.data?.metrics?.[0]?.periods?.[0]?.data?.wan?.ispAsn || "N/A"}
                                    </p>
                                </div>
                                <div className="bg-[#111] p-3 rounded-lg border border-[#222]">
                                    <h3 className="text-sm font-medium text-[#0ea5e9] mb-1">Data Points</h3>
                                    <p className="text-gray-200">{chartData.length} hours of data</p>
                                </div>
                                <div className="bg-[#111] p-3 rounded-lg border border-[#222]">
                                    <h3 className="text-sm font-medium text-[#0ea5e9] mb-1">Version</h3>
                                    <p className="text-gray-200">{networkData?.data?.metrics?.[0]?.periods?.[0]?.version || "N/A"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
