"use client"

import type React from "react"
import {useEffect} from "react"
import EditRoleSection from "@/app/components/EditRoleSection"
import SideMenu from "@/app/components/Side-menu"
import {roleExists, sessionCheck, UserHasRight} from "@/app/func/funcs"

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
        <div className="h-full w-full flex flex-col lg:flex-row">
            <div className="w-full lg:w-1/4 h-auto lg:h-screen">
                <SideMenu/>
            </div>
            <div className="w-full h-full lg:w-3/4 flex flex-col p-4 lg:p-8">
                <div className="">
                    <h1 className="text-white text-2xl lg:text-3xl mb-2">
                        <span className="font-bold uppercase">{name}</span> permissions
                    </h1>
                    <p className="text-sm lg:text-base font-light text-gray-300 max-w-2xl">
                        You can modify the permissions assigned to the <span
                        className="font-semibold">{name}</span> role. This
                        allows you to grant or restrict access to specific features, ensuring that users with this role
                        have the
                        appropriate level of control. You can enable or disable permissions such as viewing, editing,
                        deleting, or
                        managing settings based on your organization&apos;s needs.
                    </p>
                </div>
                <div className="w-full h-full flex flex-col">
                    <EditRoleSection RoleName={name}/>
                </div>
            </div>
        </div>
    )
}

export default EditRole

