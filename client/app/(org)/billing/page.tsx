"use client"
import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {Check} from "lucide-react"
import CheckoutButton from "../../components/stripe/CheckoutButton"
import QuantitySelector from "../../components/stripe/QuantitySelector"
import Cookies from "js-cookie"
import {apiUrl} from "@/app/api/config"
import axios from "axios"
import {Skeleton} from "@/components/ui/skeleton";

interface Plan {
    name: string
    price: string
    priceId: string
    basePrice: number
    description: string
    features: string[]
    popular: boolean
    minQuantity: number
    maxQuantity: number
}

const plans = {
    standard: {
        name: "Standard",
        price: "€5",
        priceId: "price_1RGl1fQw1qI3j2q2nvgWPwzD",
        basePrice: 5,
        description: "Perfect for small teams and startups",
        features: [
            "Advanced security features",
            "Task management",
            "Calendar Management",
            "Role Management",
            "Azion Cameras",
            "UniFi Integration",
        ],
        popular: false,
        minQuantity: 1,
        maxQuantity: 50,
    },
    pro: {
        name: "Pro",
        price: "€10",
        priceId: "price_1RGnggQw1qI3j2q27lmkaC2w",
        basePrice: 10,
        description: "Ideal for growing organizations",
        features: [
            "Advanced security features",
            "Task, Role & Calendar management",
            "Analytics dashboard",
            "Priority support",
            "UniFi Integration",
            "Azion Cameras",
        ],
        popular: true,
        minQuantity: 1,
        maxQuantity: 100,
    },
}

export default function BillingPage() {
    const router = useRouter()
    const [selectedPlan, setSelectedPlan] = useState<string>("pro")
    const [quantity, setQuantity] = useState<number>(10)
    const [isLoading, setIsLoading] = useState(true)
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
    const [boughtPlan, setBoughtPlan] = useState<Plan | null>(null)


    // Fetch bought plan
    useEffect(() => {
        const fetchBoughtPlans = async () => {
            try {
                const response = await axios.get(`${apiUrl}/org/get/plan`, {
                    headers: {
                        authorization: `${Cookies.get("azionAccessToken")}`,
                    },
                })
                if (response.data.plan.toLowerCase() === "pro") {
                    setIsLoading(false);
                    setBoughtPlan({
                        ...plans.pro,
                        maxQuantity: response.data.maxEmployeeCount,
                    });
                }
                if (response.data.plan.toLowerCase() === "standard") {
                    setIsLoading(false);
                    setBoughtPlan({
                        ...plans.standard,
                        maxQuantity: response.data.maxEmployeeCount,
                    });
                }
            } catch
                (error) {
                console.error("Error fetching bought plans:", error)
            }
        }

        fetchBoughtPlans()
    }, [])


    const currentPlan = plans[selectedPlan as keyof typeof plans] || plans.pro
    const totalPrice = currentPlan.basePrice * quantity

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <div className="min-h-screen bg-[#050505] w-full text-white">
            <div className="container mx-auto py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2 text-white">Complete Your Subscription</h1>
                    <p className="text-gray-400 mb-8">Review your plan details and complete your subscription</p>

                    {/* Bought Plans Section */}
                    {boughtPlan && (
                        <div className="mb-12 p-6 rounded-lg flex justify-between bg-[#0a0a0a] border border-[#222] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-4">Your Current Plan</h2>
                                <h3 className="text-lg font-medium text-white">{boughtPlan.name}</h3>
                                <p className="text-sm text-gray-400 mb-4">{boughtPlan.description}</p>
                                <ul className="space-y-2 mb-4">
                                    {boughtPlan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                            <Check size={16} className="text-[#0ea5e9] mt-0.5 flex-shrink-0"/>
                                            <span className="text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-sm text-gray-400">Max Users: {boughtPlan.maxQuantity}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400 mt-4">Price: {boughtPlan.price} per user / month</p>
                                <p className="text-sm text-gray-400 mt-4">Total: {formatCurrency(boughtPlan.basePrice * boughtPlan.maxQuantity)} / month</p>
                            </div>
                        </div>
                    )}

                    {isLoading && (
                        <div className="mb-12 p-6 rounded-lg bg-[#0a0a0a] border border-[#222] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                            <Skeleton className="h-8 w-1/4 mb-4 rounded-lg"/>
                            <Skeleton className="h-4 w-full mb-2 rounded-lg"/>
                            <Skeleton className="h-4 w-1/2 rounded-lg mb-1"/>
                            <Skeleton className="h-4 w-1/2 rounded-lg mb-1"/>
                            <Skeleton className="h-4 w-1/2 rounded-lg mb-1"/>
                            <Skeleton className="h-4 w-1/2 rounded-lg mb-1"/>
                            <Skeleton className="h-4 w-1/2 rounded-lg mb-1"/>
                            <Skeleton className="h-4 w-1/2 rounded-lg mb-1"/>
                            <Skeleton className="h-4 w-1/6 rounded-lg mb-1 mt-1"/>
                        </div>
                    )}

                    <div className="mb-12 p-6 rounded-lg bg-[#0a0a0a] border border-[#222] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <h2 className="text-xl font-semibold text-white mb-4">Available Plans</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(plans).map((planKey) => {
                                const plan = plans[planKey as keyof typeof plans];
                                const isSelected = selectedPlan === planKey;

                                return (
                                    <div
                                        key={planKey}
                                        className={`p-4 rounded-lg border ${isSelected ? "border-[#0ea5e9]" : "border-[#222]"} bg-[#111]`}
                                    >
                                        <h3 className="text-lg font-medium text-white">{plan.name}</h3>
                                        <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                                        <ul className="space-y-2 mb-4">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                    <Check size={16} className="text-[#0ea5e9] mt-0.5 flex-shrink-0"/>
                                                    <span className="text-gray-300">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-sm text-gray-400 mb-4">Price: {plan.price} per user / month</p>
                                        <button
                                            onClick={() => setSelectedPlan(planKey)}
                                            className={`w-full px-4 py-2 rounded-md text-white font-medium ${
                                                isSelected ? "bg-[#0ea5e9]" : "bg-[#333] hover:bg-[#444]"
                                            }`}
                                        >
                                            {isSelected ? "Selected" : "Choose Plan"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Plan Details */}
                    <div
                        className="mb-12 p-6 rounded-lg bg-[#0a0a0a] border border-[#222] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">Selected Plan: {currentPlan.name}</h2>
                            {currentPlan.popular && (
                                <span className="bg-[#0ea5e9] text-white text-xs font-medium px-3 py-1 rounded">MOST POPULAR</span>
                            )}
                        </div>

                        <p className="text-gray-400 mb-6">{currentPlan.description}</p>

                        <div className="bg-[#111] rounded-lg p-4 mb-6">
                            <h3 className="text-sm font-medium text-gray-300 mb-3">Features included:</h3>
                            <ul className="space-y-2">
                                {currentPlan.features.map((feature: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                        <Check size={16} className="text-[#0ea5e9] mt-0.5 flex-shrink-0"/>
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Base price:</span>
                                <span
                                    className="text-white">{formatCurrency(currentPlan.basePrice)} per user / month</span>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <span className="text-gray-400 mr-4">Number of users:</span>
                                    <QuantitySelector
                                        quantity={quantity}
                                        setQuantity={setQuantity}
                                        min={currentPlan.minQuantity}
                                        max={currentPlan.maxQuantity}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-[#222] pt-4 mt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg text-white">Total:</span>
                                    <span
                                        className="text-xl font-bold text-white">{formatCurrency(totalPrice)} / month</span>
                                </div>
                            </div>
                        </div>

                        <CheckoutButton priceId={currentPlan.priceId} quantity={quantity} className="w-full"
                                        isLoading={isCheckoutLoading}>
                            Complete Subscription
                        </CheckoutButton>

                        <p className="text-xs text-gray-400 text-center mt-4">
                            By proceeding, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>

                    <div className="text-sm text-gray-400 bg-[#0a0a0a] p-6 rounded-lg border border-[#222]">
                        <p className="font-medium text-white mb-2">Need help?</p>
                        <p className="mb-4">
                            If you have any questions about our plans or the subscription process, our team is here to
                            help.
                        </p>
                        <button
                            onClick={() => router.push("/pricing")}
                            className="text-[#0ea5e9] hover:underline hover:text-[#38bdf8] transition-colors"
                        >
                            ← Back to pricing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}