"use client"
import {useEffect, useState} from "react"
import ListAllOrgs from "@/components/listAllOrgs"
import Cookies from "js-cookie"
import Join_Organization from "../../components/JoinOrg"
import {hideButton, orgSessionCheck, PartOfOrg, UserData} from "../../func/funcs"
import Loading from "../../components/Loading"
import {Search} from "lucide-react"
import {AnimatePresence, motion} from "framer-motion"

const Organizations = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [showJoinOrg, setShowJoinOrg] = useState(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [inOrg, setInOrg] = useState<boolean>(false)
    const [userType, setUserType] = useState<string | null>(null)

    useEffect(() => {
        const CheckSessionAndOrg = async () => {
            const isSessionValid = await orgSessionCheck()
            if (isSessionValid) {
                await PartOfOrg(false)
                await hideButton().then((r) => {
                    setInOrg(r)
                })
                setLoading(false)
            }
        }

        const JoinBtnLoad = async () => {
            const userData = await UserData()
            setUserType(userData.userType)
        }

        const refreshToken = Cookies.get("azionRefreshToken")
        const accessToken = Cookies.get("azionAccessToken")

        if (refreshToken && accessToken) {
            CheckSessionAndOrg().then(() => {
                JoinBtnLoad()
            })
        } else if (!accessToken && !refreshToken) {
            window.location.href = "/login"
        }
    }, [])

    return (
        <>
            {loading ? (
                <div className="min-h-screen w-full flex justify-center items-center ">
                    <Loading/>
                </div>
            ) : (
                <div className="min-h-screen w-full  overflow-hidden flex flex-col">
                    {/* Header with gradient */}
                    <div className="relative w-full py-8 px-4 md:px-8">
                        <div className="max-w-7xl mx-auto">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Organizations</h1>
                            <p className="text-gray-300 text-sm md:text-base">
                                Browse and connect with organizations registered in Azion
                            </p>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="w-full max-w-3xl mx-auto px-4 -mt-4 mb-8 z-10">
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full bg-blue-900/10 border border-blue-800/50 rounded-lg py-3 px-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Search organizations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={18}/>
                        </div>
                    </div>

                    {/* Organizations list */}
                    <div className="flex-1 w-full overflow-y-auto px-4 pb-20">
                        <ListAllOrgs searchTerm={searchTerm}/>
                    </div>

                    {/* Join button */}
                    <AnimatePresence>
                        {!inOrg && userType === "WORKER" && (
                            <motion.button
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: 20}}
                                className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white p-4 rounded-full shadow-lg hover:shadow-blue-500/20 transition-all duration-300 z-20"
                                onClick={() => setShowJoinOrg(!showJoinOrg)}
                            >
                                {showJoinOrg ? "Close" : "Join Organization"}
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Join Organization Modal */}
                    <AnimatePresence>
                        {showJoinOrg && userType === "WORKER" && !inOrg && (
                            <Join_Organization onClose={() => setShowJoinOrg(false)}/>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </>
    )
}

export default Organizations
