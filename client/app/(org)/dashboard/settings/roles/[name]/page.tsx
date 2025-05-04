"use client"
import {use, useEffect} from "react"
import EditRoleSection from "@/app/components/EditRoleSection"
import {roleExists, sessionCheck, UserHasRight} from "@/app/func/funcs"
import {motion} from "framer-motion"

interface PageProps {
    params: Promise<{
        name: string
    }>
}

const EditRole = ({params}: PageProps) => {
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
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.5}}
            className="w-full min-h-screen text-white flex flex-col lg:flex-row lg:justify-end overflow-y-hidden"
        >
            <div className="w-full h-full flex flex-col p-4 lg:p-8 overflow-y-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">
                        <span className="uppercase">{name}</span> Role
                    </h1>
                    {name === "owner" ? (
                        <p className="text-sm lg:text-base text-gray-300 max-w-2xl mt-2">
                            You can modify the color assigned to the <span className="font-semibold">{name}</span> role.
                        </p>
                    ) : (
                        <p className="text-sm lg:text-base text-gray-300 max-w-5xl mt-2">
                            You can modify the permissions assigned to the <span
                            className="font-semibold">{name}</span> role. This
                            allows you to grant or restrict access to specific features, ensuring that users with this
                            role have the
                            appropriate level of control.
                        </p>
                    )}
                </div>
                <div
                    className="w-full h-full flex flex-col bg-[#0c0c14] border border-[#1a1a2e] rounded-lg overflow-hidden shadow-lg">
                    <EditRoleSection RoleName={name}/>
                </div>
            </div>
        </motion.div>
    )
}

export default EditRole
