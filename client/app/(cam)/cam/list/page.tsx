"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import axios from "axios"
import {apiUrl} from "@/app/api/config"
import Cookies from "js-cookie"
import Link from "next/link"
import type {Cam} from "@/app/types/types"
import {Camera, Plus} from "lucide-react"
import {sessionCheck, UserHasRight} from "@/app/func/funcs"
import ReturnButton from "@/app/components/ReturnButton"

const CamListPage = () => {
    const [cams, setCams] = useState<Cam[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const router = useRouter()

    useEffect(() => {
        UserHasRight("cameras:read")
        sessionCheck()
    }, [])

    useEffect(() => {
        const fetchCams = async () => {
            const accessToken = Cookies.get("azionAccessToken")
            if (!accessToken) {
                setError("Access Token is missing")
                setLoading(false)
                return
            }

            try {
                const response = await axios.get(`${apiUrl}/cam/all`, {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: accessToken,
                    },
                })
                setCams(response.data)
            } catch (err) {
                setError("Failed to fetch cameras")
            } finally {
                setLoading(false)
            }
        }

        fetchCams()
    }, [])

    const handleCamClick = (camName: string) => {
        router.push(`/cam/logs/${camName}`)
    }

    return (
        <div className="min-h-screen bg-base-300 text-white p-3 sm:p-4 relative">
            <div className="absolute top-4 left-4">
                <ReturnButton hasOrg={true}/>
            </div>
            <div className="max-w-4xl mx-auto pt-14 sm:pt-16 pb-20">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center text-lightAccent">
                    Camera List
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-pulse text-accent">Loading cameras...</div>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 text-red-400 p-4 rounded-lg text-center">{error}</div>
                ) : cams.length === 0 ? (
                    <div className="bg-base-200 rounded-lg p-6 sm:p-8 text-center">
                        <p className="text-gray-400 mb-4">No cameras registered yet</p>
                        <Link
                            href="/cam/register"
                            className="inline-flex items-center gap-2 bg-accent hover:bg-lightAccent text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Plus size={18}/>
                            Register your first camera
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                        {cams.map((cam) => (
                            <div
                                key={cam.camName}
                                onClick={() => handleCamClick(cam.camName)}
                                className="bg-base-200 hover:bg-base-100 p-3 sm:p-4 rounded-lg cursor-pointer transition-colors flex items-center gap-3"
                            >
                                <div className="bg-accent/20 p-2 rounded-full">
                                    <Camera size={24} className="text-accent"/>
                                </div>
                                <div>
                                    <h3 className="font-medium">{cam.camName}</h3>
                                    <p className="text-sm text-gray-400">Click to view logs</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 flex gap-2 sm:gap-3">
                <Link
                    href="/cam-test"
                    className="bg-base-100 hover:bg-base-200 text-white p-2.5 sm:p-3 rounded-full shadow-lg transition-colors"
                >
                    <Camera size={20} className="text-accent sm:hidden"/>
                    <Camera size={24} className="text-accent hidden sm:block"/>
                </Link>
                <Link
                    href="/cam/register"
                    className="bg-accent hover:bg-lightAccent text-white p-2.5 sm:p-3 rounded-full shadow-lg transition-colors"
                >
                    <Plus size={20} className="sm:hidden"/>
                    <Plus size={24} className="hidden sm:block"/>
                </Link>
            </div>
        </div>
    )
}

export default CamListPage

