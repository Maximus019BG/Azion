"use client"

import type React from "react"
import {useEffect} from "react"
import {roleExists, sessionCheck, UserHasRight} from "@/app/func/funcs"
import EditRoleSection from "@/app/components/EditRoleSection"
import SideMenu from "@/app/components/Side-menu"
import {ArrowLeft, Shield} from "lucide-react"
import Link from "next/link"

interface PageProps {
    params: {
        name: string
    }
}

const EditRole: React.FC<PageProps> = ({params}) => {
    const {name} = params

    useEffect(() => {
        const init = async () => {
            // Basic checks
            if (!(await roleExists(name))) {
                window.location.href = window.location.pathname.slice(0, window.location.pathname.length - name.length)
            }

            UserHasRight("roles:write")
            sessionCheck()
        }
        init()
    }, [name])

    return (
        <div className="w-full h-dvh text-white flex flex-col lg:flex-row">
            <div className="w-full lg:w-1/4 h-fit lg:h-full">
                <SideMenu/>
            </div>
            <div className="size-full lg:w-3/4 flex flex-col p-4 lg:p-8">
                <div className="mb-6">
                    <Link
                        href="/dashboard/settings/roles"
                        className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Back to Roles
                    </Link>

                    <div className="flex items-center gap-3 mb-3">
                        <Shield className="h-8 w-8 text-blue-500"/>
                        <h1 className="text-3xl font-bold">
                            <span className="uppercase">{name}</span> Role
                        </h1>
                    </div>

                    <p className="text-gray-400 max-w-3xl">
                        Customize the permissions for the <span className="font-medium text-white">{name}</span> role.
                        Define what
                        users with this role can access and modify within your organization.
                    </p>
                </div>

                <div className="size-full bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <div className="border-b border-gray-700 p-4 bg-base-300">
                        <h2 className="text-lg font-medium">Role Configuration</h2>
                        <p className="text-sm text-gray-400">Manage permissions and appearance for this role</p>
                    </div>

                    <EditRoleSection RoleName={name}/>
                </div>
            </div>
        </div>
    )
}

export default EditRole

