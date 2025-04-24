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
import {Role} from "@/app/types/types"

export default function RegisterCam() {
    const [camId, setCamId] = useState("")
    const [roles, setRoles] = useState<Role[]>([])
    const [selectedRole, setSelectedRole] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        UserHasRight("cameras:write")
        sessionCheck()
        fetchRoles()
    }, [])

    const fetchRoles = async () => {
        const accessToken = Cookies.get("azionAccessToken")
        try {
            const response = await axios.get(`${apiUrl}/org/list/roles/${accessToken}`)
            setRoles(response.data)
        } catch (error) {
            console.error("Error fetching roles: ", error)
            setError("Failed to fetch roles")
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setSubmitting(true)
        setError("")
        setSuccess(false)

        const accessToken = Cookies.get("azionAccessToken")

        const payload = {
            camName: camId,
            roleId: selectedRole,
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
            setSelectedRole("")
        } catch (error: any) {
            console.error("Error registering camera: ", error)
            setError(error.response?.data || "Failed to register camera")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative">
            <div className="absolute top-4 sm:top-5 left-4 sm:left-5">
                <ReturnButton to={"/cam/list"}/>
            </div>
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
                        <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-1">
                            Role
                        </label>
                        <select
                            id="role"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full p-3 bg-base-100 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent focus:outline-none"
                            required
                        >
                            <option value="" disabled>Select a role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id ?? ""}>{role.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !camId || !selectedRole}
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