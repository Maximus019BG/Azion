import type React from "react"
import {Check} from "lucide-react"

interface PasswordRequirementItemProps {
    text: string
    isMet: boolean
}

const PasswordRequirementItem: React.FC<PasswordRequirementItemProps> = ({text, isMet}) => {
    return (
        <li className={`text-xs flex items-start gap-1 ${isMet ? "text-green-400" : "text-gray-500"}`}>
      <span className="mt-0.5 flex items-center justify-center w-4 h-4">
        {isMet ? <Check size={12} className="text-green-400"/> : <span className="text-gray-500">•</span>}
      </span>
            {text}
        </li>
    )
}

export default PasswordRequirementItem
