"use client"
import React from "react"
import axios from "axios"
import {apiUrl} from "@/app/api/config"
import Cookie from "js-cookie"
import {X} from "lucide-react"
import {useRouter} from "next/navigation"

interface CancelButtonProps {
    subscriptionId?: string
    className?: string
    variant?: "default" | "outline"
}

const CancelButton: React.FC<CancelButtonProps> = ({subscriptionId, className = "", variant = "default"}) => {
    const [loading, setLoading] = React.useState(false)
    const router = useRouter()

    const handleCancel = async () => {
        try {
            setLoading(true)
            const res = await axios.post(
                `${apiUrl}/api/subscription/cancel`,
                {
                    userId: "123456", // This should be dynamic in a real app
                    subscriptionId,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: Cookie.get("azionAccessToken"),
                    },
                },
            )

            if (res.status === 200) {
                router.push("/billing/cancel")
            }
        } catch (error) {
            console.error("Cancellation failed:", error)
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleCancel}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-md transition-all duration-300 ${
                variant === "outline"
                    ? "bg-transparent border border-[#333] hover:border-[#0ea5e9] text-gray-300 hover:text-[#0ea5e9] hover:shadow-[0_0_10px_rgba(14,165,233,0.3)]"
                    : "bg-[#b91c1c] hover:bg-[#991b1b] text-white shadow-[0_0_10px_rgba(185,28,28,0.3)] hover:shadow-[0_0_15px_rgba(185,28,28,0.5)]"
            } ${className}`}
        >
            {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"/>
            ) : (
                <X className="h-4 w-4"/>
            )}
            Cancel Subscription
        </button>
    )
}

export default CancelButton
