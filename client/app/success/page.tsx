"use client"
import React from "react"
import {loadStripe} from "@stripe/stripe-js"
import {ShoppingCart} from "lucide-react"
import {useRouter} from "next/navigation"
import {apiUrl} from "@/app/api/config";
import Cookie from "js-cookie";
import axios from "axios";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)

interface CheckoutButtonProps {
    priceId: string
    quantity?: number
    className?: string
    isLoading?: boolean
    children?: React.ReactNode
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({
                                                           priceId,
                                                           quantity = 1,
                                                           className = "",
                                                           isLoading = false,
                                                           children,
                                                       }) => {
    const [loading, setLoading] = React.useState(isLoading)
    const router = useRouter()

    const handleCheckout = async () => {
        try {
            setLoading(true)

            // For demo purposes, we'll simulate a success or failure
            // In a real app, you would make an API call to create a checkout session
            const success = Math.random() > 0.2 // 80% success rate

            setTimeout(() => {
                if (success) {
                    router.push("/billing/success")
                } else {
                    router.push("/billing/cancel")
                }
            }, 1500)

            // In a real app, you would do something like this:

            const response = await axios.post(
                `${apiUrl}/checkout`,
                {priceId, quantity},
                {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: Cookie.get("azionAccessToken"),
                    },
                },
            )
            const sessionId = response.data.id

            const stripe = await stripePromise
            if (stripe) {
                const {error} = await stripe.redirectToCheckout({
                    sessionId,
                })

                if (error) {
                    console.error("Error redirecting to checkout:", error)
                    setLoading(false)
                }
            }
        } catch (error) {
            console.error("Error during checkout session creation:", error)
            setLoading(false)
            router.push("/billing/cancel")
        }
    }

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium transition-all duration-300 shadow-[0_0_15px_rgba(14,165,233,0.5)] hover:shadow-[0_0_20px_rgba(14,165,233,0.7)] ${className}`}
        >
            {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"/>
            ) : (
                <>
                    <ShoppingCart className="h-4 w-4"/>
                    {children || "Checkout"}
                </>
            )}
        </button>
    )
}

export default CheckoutButton
