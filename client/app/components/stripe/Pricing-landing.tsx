"use client"
import {useState} from "react"
import {useRouter} from "next/navigation"
import {Check} from "lucide-react"

export default function PricingPage() {
    const [selectedPlan, setSelectedPlan] = useState<any>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()

    const plans = [
        {
            name: "Free",
            price: "$0",
            interval: "per user / month",
            description: "Perfect for people who want to use only the basic of Azion",
            features: ["Up to 5 users", "Task management", "Analytics"],
            priceId: "price_free",
            buttonText: "Get Started",
            buttonLink: "/register",
            highlight: false,
        },
        {
            name: "Standart",
            price: "$5",
            interval: "per user / month",
            description: "Perfect for small teams and startups",
            features: [
                "Advanced security features",
                "Task management",
                "Calendar Management",
                "Role Management",
                "Azion Cameras",
                "UniFi Integration",
            ],
            priceId: "price_standard",
            buttonText: "Get Started",
            buttonLink: "/billing",
            highlight: false,
        },
        {
            name: "Pro",
            price: "$10",
            interval: "per user / month",
            description: "Ideal for growing organizations",
            features: [
                "Advanced security features",
                "Task, Role & Calendar management",
                "Analytics dashboard",
                "Priority support",
                "UniFi Integration",
                "Azion Cameras",
            ],
            priceId: "price_pro",
            buttonText: "Get Started",
            buttonLink: "/billing",
            highlight: true,
            popular: true,
        },
        {
            name: "Enterprise",
            price: "Custom",
            subtitle: "",
            interval: "",
            description: "For large organizations with advanced needs",
            features: [
                "Unlimited users",
                "Advanced analytics",
                "Custom integrations",
                "Dedicated account manager",
                "24/7 premium support",
            ],
            priceId: "price_enterprise",
            buttonText: "Contact Sales",
            buttonLink: "/contact",
            highlight: false,
            isCustom: true,
        },
    ]

    const handlePlanClick = (plan: any) => {
        if (plan.name === "Free") {
            router.push("/register")
        } else if (plan.isCustom) {
            router.push("/contact")
        } else {
            // For paid plans, redirect to billing with plan info
            router.push(`/billing?plan=${plan.name.toLowerCase()}&priceId=${plan.priceId}`)
        }
    }

    return (
        <div className="flex justify-start items-stretch gap-6 mx-auto flex-wrap">
            {plans.map((plan, index) => (
                <div
                    key={index}
                    className={`bg-[#0a0a0a] min-h-[520px] w-[300px] border border-[#222] rounded-lg overflow-hidden flex flex-col justify-between ${
                        plan.highlight ? "relative" : ""
                    }`}
                >
                    {plan.popular && (
                        <div className="bg-[#0ea5e9] text-white text-xs font-medium px-4 py-1 text-center">
                            MOST POPULAR
                        </div>
                    )}

                    <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                        <div className="mb-4">
                            <div className="flex items-baseline">
                                <span className="text-3xl font-bold">{plan.price}</span>
                                {plan.subtitle && (
                                    <span className="text-3xl font-bold block mt-1">
                {plan.subtitle}
              </span>
                                )}
                                {plan.interval && (
                                    <span className="text-gray-400 ml-2">{plan.interval}</span>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
                        <ul className="space-y-3 mb-6">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                    <Check size={16} className="text-[#0ea5e9] mt-0.5 flex-shrink-0"/>
                                    <span className="text-gray-300">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="px-6 pb-6">
                        <button
                            className={`w-full py-2 px-4 rounded-md text-center ${
                                plan.highlight
                                    ? "bg-[#0ea5e9] hover:bg-[#0284c7] text-white"
                                    : "border border-[#333] hover:border-[#0ea5e9] text-white hover:text-[#0ea5e9]"
                            } transition-colors duration-200`}
                            onClick={() => handlePlanClick(plan)}
                        >
                            {plan.buttonText}
                        </button>
                    </div>
                </div>
            ))}
        </div>

    )
}
