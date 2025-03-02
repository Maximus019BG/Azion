"use client"

import type React from "react"
import {useEffect, useState} from "react"
import axios from "axios"
import {apiUrl} from "@/app/api/config"
import Cookies from "js-cookie"
import Link from "next/link"
import {Camera, Check, Loader2} from "lucide-react"
import {sessionCheck, UserHasRight} from "@/app/func/funcs"
import ReturnButton from "@/app/components/ReturnButton"

export default function RegisterCam() {
    const [camId, setCamId] = useState("")
    const [roleLevel, setRoleLevel] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        UserHasRight("cameras:write")
        sessionCheck()
    }, [])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setSubmitting(true)
        setError("")
        setSuccess(false)

        const accessToken = Cookies.get("azionAccessToken")

        const payload = {
            camName: camId,
            roleLevel,
        }

        try {
            await axios.post(`${apiUrl}/cam/add`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    authorization: accessToken,
                },
            })
            setSuccess(true)
            setCamId("")
            setRoleLevel(0)
        } catch (error: any) {
            console.error("Error registering camera: ", error)
            setError(error.response?.data || "Failed to register camera")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-base-300 flex flex-col items-center justify-center p-4 relative">

            <ReturnButton hasOrg={true}/>

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex justify-center items-center w-16 h-16 bg-accent/20 rounded-full mb-4">
                        <Camera size={32} className="text-accent"/>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-lightAccent">Register New Camera</h1>
                </div>

                {success && (
                    <div className="mb-6 bg-green-900/20 text-green-400 p-4 rounded-lg flex items-center gap-2">
                        <Check size={20}/>
                        Camera registered successfully
                    </div>
                )}

                {error && <div className="mb-6 bg-red-900/20 text-red-400 p-4 rounded-lg">{error}</div>}

                <form onSubmit={handleSubmit} className="bg-base-200 rounded-lg p-6 shadow-lg">
                    <div className="mb-4">
                        <label htmlFor="camId" className="block text-sm font-medium text-gray-400 mb-1">
                            Camera ID
                        </label>
                        <input
                            id="camId"
                            type="text"
                            placeholder="Enter camera identifier"
                            value={camId}
                            onChange={(e) => setCamId(e.target.value)}
                            className="w-full p-3 bg-base-100 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent focus:outline-none"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="roleLevel" className="block text-sm font-medium text-gray-400 mb-1">
                            Role Level
                        </label>
                        <input
                            id="roleLevel"
                            type="number"
                            placeholder="Enter role level"
                            value={roleLevel}
                            onChange={(e) => setRoleLevel(Number.parseInt(e.target.value) || 0)}
                            className="w-full p-3 bg-base-100 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent focus:outline-none"
                            required
                            min="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Determines the access level required to view this
                            camera</p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !camId}
                        className="w-full bg-accent hover:bg-lightAccent text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin mr-2"/>
                                Registering...
                            </>
                        ) : (
                            "Register Camera"
                        )}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <Link href="/cam-test" className="text-accent hover:text-lightAccent text-sm">
                        Need to test a camera first?
                    </Link>
                </div>
            </div>
        </div>
    )
}

