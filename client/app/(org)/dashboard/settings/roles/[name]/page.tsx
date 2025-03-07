"use client"
import type React from "react"
import {use, useEffect} from "react"
import EditRoleSection from "@/app/components/EditRoleSection"
import SideMenu from "@/app/components/Side-menu"
import {roleExists, sessionCheck, UserHasRight} from "@/app/func/funcs"
import ReturnButton from "@/app/components/ReturnButton";

interface PageProps {
    params: Promise<{
        name: string
    }>
}

const EditRole: React.FC<PageProps> = ({params}) => {
    const {name} = use(params)

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
        <div className="w-full h-screen lg:h-full flex flex-col lg:flex-row lg:justify-end overflow-y-hidden">
            <div className="lg:fixed lg:h-screen lg:top-0 lg:left-0 h-fit w-full lg:w-1/4 z-50">
                <SideMenu/>
            </div>
            <div className="absolute top-4 sm:top-5 right-4 sm:right-5">
                <ReturnButton to={"/dashboard/settings/roles"}/>
            </div>
            <div className="w-full h-full lg:w-3/4 lg:self-end flex flex-col p-4 lg:p-8 overflow-y-auto">
                <div className="">
                    <h1 className="text-white text-2xl lg:text-3xl mb-2">
                        <span className="font-bold uppercase">{name}</span> permissions
                    </h1>
                    {name === "owner" ? (
                        <p className="text-sm lg:text-base font-light text-gray-300 max-w-2xl">
                            You can modify the color assigned to the <span className="font-semibold">{name}</span> role.
                        </p>
                    ) : (
                        <p className="text-sm lg:text-base font-light text-gray-300 max-w-5xl">
                            You can modify the permissions assigned to the <span
                            className="font-semibold">{name}</span> role. This
                            allows you to grant or restrict access to specific features, ensuring that users with this
                            role have the
                            appropriate level of control. You can enable or disable permissions such as viewing,
                            editing, deleting, or
                            managing settings based on your organization&apos;s needs.
                        </p>
                    )}
                </div>
                <div className="w-full h-full mt-2 flex flex-col bg-base-300 rounded-md overflow-hidden">
                    <EditRoleSection RoleName={name}/>
                </div>
            </div>
        </div>
    )
}

export default EditRole