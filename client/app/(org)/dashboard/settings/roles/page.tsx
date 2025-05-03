"use client"
import {useEffect, useState} from "react"
import Cookies from "js-cookie"
import {PartOfOrg, sessionCheck, UserData, UserHasRight} from "@/app/func/funcs"
import RoleList from "@/app/components/role-list"
import {motion} from "framer-motion"

const RoleEdit = () => {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken")
        const accessToken = Cookies.get("azionAccessToken")

        if (refreshToken && accessToken) {
            PartOfOrg(true).then()
            sessionCheck()
            setTimeout(() => {
                UserData().then((response) => {
                    setLoading(false)
                })
            }, 1000)
        } else if (!accessToken && !refreshToken) {
            window.location.href = "/login"
        }
    }, [])

    useEffect(() => {
        UserHasRight("roles:write")
        sessionCheck()
    })

    if (loading) {
        return (
            <div className="w-full min-h-screen  flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-400/20"></div>
                        <div
                            className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>
                    </div>
                    <p className="text-blue-300 mt-4 font-medium">Loading roles...</p>
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.5}}
            className="w-full min-h-screen bg-gradient-to-br from-[#050505] to-[#0c0c0c] text-white flex flex-col lg:flex-row"
        >
            <div className="w-full flex justify-center items-start p-4 sm:p-6 md:p-8">
                <div className="w-full max-w-4xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
                            Role Management
                        </h1>
                        <p className="text-gray-400 mt-2">Manage roles and permissions for your organization members</p>
                    </div>
                    <RoleList/>
                </div>
            </div>
        </motion.div>
    )
}

export default RoleEdit
