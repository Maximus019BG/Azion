"use client"

import {useCallback, useEffect, useState} from "react"
import {usePathname} from "next/navigation"
import axios from "axios"
import {apiUrl} from "@/app/api/config"
import Cookies from "js-cookie"
import {Download, RefreshCw} from "lucide-react"
import {sessionCheck, UserHasRight} from "@/app/func/funcs"
import ReturnButton from "@/app/components/ReturnButton"

const CamLogsPage = () => {
    const pathname = usePathname()
    const camId = pathname.split("/").pop()
    const [logs, setLogs] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        UserHasRight("cameras:read")
        sessionCheck()
    }, [])

    const fetchLogs = useCallback(async () => {
        if (!camId) return

        setRefreshing(true)
        const accessToken = Cookies.get("azionAccessToken")

        if (!accessToken) {
            setError("Access Token is missing")
            setLoading(false)
            setRefreshing(false)
            return
        }

        try {
            const response = await axios.get(`${apiUrl}/cam/logs/${camId}`, {
                headers: {
                    "Content-Type": "application/json",
                    authorization: accessToken,
                },
            })

            if (response.data && response.data.logs) {
                setLogs(response.data.logs.split("\n"))
                setError("")
            } else {
                setError("Logs data is not in the expected format")
            }
        } catch (err) {
            setError("Failed to fetch logs")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [camId])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    const downloadLogs = () => {
        if (logs.length === 0) return

        const element = document.createElement("a")
        const file = new Blob([logs.join("\n")], {type: "text/plain"})
        element.href = URL.createObjectURL(file)
        element.download = `${camId}-logs.txt`
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    return (
        <div className="min-h-screen w-full bg-base-300 p-3 sm:p-4 relative">
            <div className="absolute top-4 left-4">
                <ReturnButton to={"/cam/list"}/>
            </div>

            <div className="max-w-5xl mx-auto pt-14 sm:pt-16 pb-6 sm:pb-8">
                <div
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-lightAccent">
                        Logs: <span className="text-white">{camId}</span>
                    </h1>

                    <div className="flex gap-2">
                        <button
                            onClick={fetchLogs}
                            disabled={refreshing}
                            className="bg-base-100 hover:bg-base-200 text-white p-2 rounded-lg transition-colors flex items-center gap-2 flex-1 sm:flex-auto justify-center sm:justify-start"
                        >
                            <RefreshCw
                                size={16}
                                className={`${refreshing ? "animate-spin text-accent" : "text-accent"} sm:size-18`}
                            />
                            <span className="text-sm sm:text-base">Refresh</span>
                        </button>

                        <button
                            onClick={downloadLogs}
                            disabled={logs.length === 0}
                            className="bg-accent hover:bg-lightAccent text-white p-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 flex-1 sm:flex-auto justify-center sm:justify-start"
                        >
                            <Download size={16} className="sm:size-18"/>
                            <span className="text-sm sm:text-base">Download</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-pulse text-accent">Loading logs...</div>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 text-red-400 p-4 rounded-lg">{error}</div>
                ) : logs.length === 0 ? (
                    <div className="bg-base-200 p-6 sm:p-8 rounded-lg text-center text-gray-400">
                        No logs available for this camera
                    </div>
                ) : (
                    <div className="bg-base-100 rounded-lg overflow-hidden shadow-lg">
                        <div className="bg-base-200 px-3 sm:px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
                            Camera Logs
                        </div>
                        <pre
                            className="p-3 sm:p-4 overflow-auto text-gray-300 text-xs sm:text-sm h-[60vh] sm:h-[70vh] whitespace-pre-wrap">
              {logs.join("\n")}
            </pre>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CamLogsPage

