import React from 'react';
import {FaBuilding, FaMapMarkerAlt, FaEnvelope, FaPhone, FaInfoCircle, FaTag, FaExclamationTriangle, FaExclamationCircle, FaCheckCircle, FaArrowAltCircleDown} from 'react-icons/fa';
import {FcHighPriority, FcLowPriority, FcMediumPriority} from "react-icons/fc";
import {MdOutlinePriorityHigh} from "react-icons/md";
import {BsExclamationOctagonFill} from "react-icons/bs";

interface Task {
    title: string;
    description: string;
    status: string;
    data: string;
    createdBy: string;
    priority: string;
    onClick: () => void;
}

const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
        case 'very_high':
            return <FcHighPriority className="text-xl"/>;
        case 'high':
            return <BsExclamationOctagonFill className="text-orange-500 text-xl"/>;
        case 'medium':
            return <FcMediumPriority className="text-xl"/>;
        case 'low':
            return <FaArrowAltCircleDown  className="text-green-700 text-xl"/>;
        default:
            return null;
    }
};

const OrgDetailsCard: React.FC<Task> = ({title, description, status, data, priority, createdBy, onClick}) => {

    return (
        <div className="max-w-sm rounded-lg overflow-hidden shadow-lg p-6 bg-lightAccent hover:bg-lightAccentHover transition duration-300 ease-in-out transform hover:scale-105 relative" onClick={onClick}>
            <div className="absolute top-3 right-4 flex items-center group">
                {getPriorityIcon(priority)} <span className="ml-1"></span>
                <div className="absolute top-0 right-0 mt-6 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2">
                    Priority: {priority.toUpperCase()}
                </div>
            </div>
            <div className="font-bold text-xl mb-4 flex items-center text-white">
                <FaBuilding className="mr-2"/> {title}
            </div>
            <p className="text-gray-200 text-base flex items-center mb-2">
                <FaMapMarkerAlt className="mr-2"/> {description}
            </p>
            <p className="text-gray-200 text-base flex items-center mb-2">
                <FaTag className="mr-2"/> {status}
            </p>
            <p className="text-gray-200 text-base flex items-center mb-2">
                <FaInfoCircle className="mr-2"/> {data}
            </p>
            <p className="text-gray-200 text-base flex items-center">
                <FaEnvelope className="mr-2"/> {createdBy}
            </p>
        </div>
    );
};

export default OrgDetailsCard;