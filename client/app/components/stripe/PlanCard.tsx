"use client"
import type React from "react"
import {useState} from "react"
import {Check} from "lucide-react"
import CheckoutButton from "./CheckoutButton"
import QuantitySelector from "./QuantitySelector"

interface Feature {
    name: string
    included: boolean
}

interface PlanCardProps {
    name: string
    description: string
    priceId: string
    basePrice: number
    currency?: string
    interval?: string
    features: Feature[]
    popular?: boolean
    minQuantity?: number
    maxQuantity?: number
    perUser?: boolean
}

const PlanCard: React.FC<PlanCardProps> = ({
                                               name,
                                               description,
                                               priceId,
                                               basePrice,
                                               currency = "USD",
                                               interval = "month",
                                               features,
                                               popular = false,
                                               minQuantity = 1,
                                               maxQuantity = 100,
                                               perUser = true,
                                           }) => {
    const [quantity, setQuantity] = useState(minQuantity)
    const totalPrice = basePrice * quantity

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <div
            className={`flex flex-col rounded-lg bg-[#0a0a0a] border ${
                popular ? "border-[#0ea5e9] shadow-[0_0_20px_rgba(14,165,233,0.3)]" : "border-[#222]"
            } overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(14,165,233,0.2)]`}
        >
            {popular && (
                <div
                    className="bg-[#0ea5e9] text-white text-xs font-semibold px-3 py-1 text-center shadow-[0_0_10px_rgba(14,165,233,0.5)]">
                    POPULAR
                </div>
            )}

            <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
                <p className="text-gray-400 mb-6">{description}</p>

                <div className="mb-6">
                    <p className="text-3xl font-bold text-white">
                        {formatCurrency(totalPrice)}
                        <span className="text-sm font-normal text-gray-400">/{interval}</span>
                    </p>
                    {perUser && <p className="text-sm text-gray-400">{formatCurrency(basePrice)} per user</p>}
                </div>

                <ul className="space-y-3 mb-6">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                            <div className={`mr-2 mt-1 ${feature.included ? "text-[#0ea5e9]" : "text-gray-600"}`}>
                                <Check className="h-4 w-4"/>
                            </div>
                            <span
                                className={feature.included ? "text-gray-300" : "text-gray-500 line-through"}>{feature.name}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-auto p-6 bg-[#111] border-t border-[#222]">
                {perUser && (
                    <div className="flex items-center justify-between w-full mb-4">
                        <span className="text-sm text-gray-400">Users:</span>
                        <QuantitySelector quantity={quantity} setQuantity={setQuantity} min={minQuantity}
                                          max={maxQuantity}/>
                    </div>
                )}

                <CheckoutButton priceId={priceId} quantity={quantity} className="w-full"/>
            </div>
        </div>
    )
}

export default PlanCard
