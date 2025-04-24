"use client"

import {useEffect, useState} from "react"
import {useParams} from "next/navigation"
import axios from "axios"
import Cookies from "js-cookie"
import {sessionCheck, UserHasRight} from "@/app/func/funcs"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Formatter,
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts"
import {ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart"
import {Activity, ArrowDown, Clock, Gauge, Wifi} from 'lucide-react'
import {format} from "date-fns"
import {apiUrl} from "@/app/api/config"

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
        } catch (error) {
            console.error("Failed to fetch network data:", error)
            setLoading(false)
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

    // Formatter functions for chart tooltips with the correct Recharts Formatter signature
    const formatLatency: Formatter<any, any> = (value: string) => {
        return `${value} ms`;
    }

    const formatSpeed: Formatter<any, any> = (value: string) => {
        return `${value} Mbps`;
    }

    const formatPercentage: Formatter<any, any> = (value: string) => {
        return `${value}%`;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-dvh w-full bg-gray-950 text-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2">Network Monitoring</h1>
                    <p className="text-gray-400">
                        Detailed metrics for network {networkId}
                        {averages && ` - ${averages.ispName}`}
                    </p>
                </div>

                {/* Time Range Selector */}
                <div className="mb-6">
                    <Tabs defaultValue="24h" value={timeRange} onValueChange={handleTimeRangeChange} className="w-full">
                        <TabsList className="bg-gray-900 border border-gray-800">
                            <TabsTrigger value="24h" className="data-[state=active]:bg-blue-900">
                                Last 24 Hours
                            </TabsTrigger>
                            <TabsTrigger value="7d" className="data-[state=active]:bg-blue-900">
                                Last 7 Days
                            </TabsTrigger>
                            <TabsTrigger value="30d" className="data-[state=active]:bg-blue-900">
                                Last 30 Days
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Summary Cards */}
                {averages && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-gray-400">Average Latency</CardDescription>
                                <CardTitle className="text-2xl flex items-center">
                                    <Clock className="mr-2 h-5 w-5 text-blue-400"/>
                                    {averages.avgLatency} ms
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-400">Max: {averages.maxLatency} ms</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-gray-400">Download Speed</CardDescription>
                                <CardTitle className="text-2xl flex items-center">
                                    <ArrowDown className="mr-2 h-5 w-5 text-green-400"/>
                                    {averages.download} Mbps
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-400">Upload: {averages.upload} Mbps</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-gray-400">Packet Loss</CardDescription>
                                <CardTitle className="text-2xl flex items-center">
                                    <Activity className="mr-2 h-5 w-5 text-yellow-400"/>
                                    {averages.packetLoss}%
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-400">
                                    {Number(averages.packetLoss) > 0 ? "Some packet loss detected" : "No packet loss detected"}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-gray-400">Uptime</CardDescription>
                                <CardTitle className="text-2xl flex items-center">
                                    <Wifi className="mr-2 h-5 w-5 text-blue-400"/>
                                    {averages.uptime}%
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-400">
                                    {Number(averages.uptime) === 100
                                        ? "Perfect uptime"
                                        : `${(100 - Number(averages.uptime)).toFixed(2)}% downtime`}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Latency Chart */}
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle>Latency</CardTitle>
                            <CardDescription>Average and maximum latency over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ChartContainer
                                    config={{
                                        avgLatency: {
                                            label: "Avg Latency",
                                            color: "hsl(217, 91%, 60%)",
                                        },
                                        maxLatency: {
                                            label: "Max Latency",
                                            color: "hsl(13, 90%, 55%)",
                                        },
                                    }}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
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
                                                stroke="hsl(217, 91%, 60%)"
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={{r: 4}}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="maxLatency"
                                                stroke="hsl(13, 90%, 55%)"
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

                    {/* Speed Chart */}
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle>Network Speed</CardTitle>
                            <CardDescription>Download and upload speeds over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ChartContainer
                                    config={{
                                        download: {
                                            label: "Download",
                                            color: "hsl(142, 76%, 36%)",
                                        },
                                        upload: {
                                            label: "Upload",
                                            color: "hsl(262, 83%, 58%)",
                                        },
                                    }}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
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
                                                stroke="hsl(142, 76%, 36%)"
                                                fill="hsl(142, 76%, 36%, 0.2)"
                                                strokeWidth={2}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="upload"
                                                stroke="hsl(262, 83%, 58%)"
                                                fill="hsl(262, 83%, 58%, 0.2)"
                                                strokeWidth={2}
                                            />
                                            <ChartLegend/>
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Packet Loss Chart */}
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle>Packet Loss</CardTitle>
                            <CardDescription>Packet loss percentage over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ChartContainer
                                    config={{
                                        packetLoss: {
                                            label: "Packet Loss",
                                            color: "hsl(43, 96%, 56%)",
                                        },
                                    }}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
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
                                            <Bar dataKey="packetLoss" fill="hsl(43, 96%, 56%)" radius={[4, 4, 0, 0]}/>
                                            <ChartLegend/>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Uptime Chart */}
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle>Network Uptime</CardTitle>
                            <CardDescription>Uptime percentage over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ChartContainer
                                    config={{
                                        uptime: {
                                            label: "Uptime",
                                            color: "hsl(191, 91%, 54%)",
                                        },
                                    }}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
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
                                                stroke="hsl(191, 91%, 54%)"
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
                </div>

                {/* Anomalies Section */}
                {anomalies.length > 0 && (
                    <Card className="bg-gray-900 border-gray-800 mb-6">
                        <CardHeader>
                            <CardTitle>Network Anomalies</CardTitle>
                            <CardDescription>Detected issues during the selected time period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {anomalies.map((anomaly, index) => (
                                    <div key={index} className="border border-gray-800 rounded-lg p-4">
                                        <h3 className="text-lg font-medium mb-2 flex items-center">
                                            {anomaly.type === "Packet Loss" &&
                                                <Activity className="mr-2 h-5 w-5 text-yellow-400"/>}
                                            {anomaly.type === "Downtime" &&
                                                <Wifi className="mr-2 h-5 w-5 text-red-400"/>}
                                            {anomaly.type === "High Latency" &&
                                                <Gauge className="mr-2 h-5 w-5 text-orange-400"/>}
                                            {anomaly.type} ({anomaly.count} events)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {anomaly.events.slice(0, 6).map((event: any, eventIndex: number) => (
                                                <div key={eventIndex} className="bg-gray-800 p-2 rounded text-sm">
                                                    <span className="text-gray-400">{event.time}:</span>{" "}
                                                    {anomaly.type === "Packet Loss" && `${event.value}% loss`}
                                                    {anomaly.type === "Downtime" && `${event.value} seconds`}
                                                    {anomaly.type === "High Latency" && `${event.value}ms`}
                                                </div>
                                            ))}
                                            {anomaly.events.length > 6 && (
                                                <div className="bg-gray-800 p-2 rounded text-sm text-gray-400">
                                                    +{anomaly.events.length - 6} more events...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Network Details */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle>Network Details</CardTitle>
                        <CardDescription>Technical information about this network</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 mb-1">Site ID</h3>
                                <p className="text-gray-200 font-mono text-sm">{networkData?.data?.metrics?.[0]?.siteId || "N/A"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 mb-1">Host ID</h3>
                                <p className="text-gray-200 font-mono text-sm">{networkData?.data?.metrics?.[0]?.hostId || "N/A"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 mb-1">ISP</h3>
                                <p className="text-gray-200">{chartData[0]?.ispName || "N/A"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 mb-1">ASN</h3>
                                <p className="text-gray-200">
                                    {networkData?.data?.metrics?.[0]?.periods?.[0]?.data?.wan?.ispAsn || "N/A"}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 mb-1">Data Points</h3>
                                <p className="text-gray-200">{chartData.length} hours of data</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 mb-1">Version</h3>
                                <p className="text-gray-200">{networkData?.data?.metrics?.[0]?.periods?.[0]?.version || "N/A"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
