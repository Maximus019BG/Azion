import React from 'react';
import { FaBuilding, FaMapMarkerAlt, FaEnvelope, FaPhone, FaInfoCircle, FaTag } from 'react-icons/fa';

interface OrgDetailsCardProps {
    orgName: string;
    orgAddress: string;
    orgEmail: string;
    orgType: string;
    orgPhone: string;
    orgDescription: string;
}


const OrgDetailsCard: React.FC<OrgDetailsCardProps> = ({ orgName, orgAddress, orgEmail, orgType, orgPhone, orgDescription }) => {
    return (
        <div className="max-w-sm rounded overflow-hidden shadow-lg p-6 bg-white">
            <div className="font-bold text-xl mb-2 flex items-center">
                <FaBuilding className="mr-2" /> {orgName}
            </div>
            <p className="text-gray-700 text-base flex items-center mb-2">
                <FaMapMarkerAlt className="mr-2" /> {orgAddress}
            </p>
            <p className="text-gray-700 text-base flex items-center mb-2">
                <FaTag className="mr-2" /> {orgType}
            </p>
            <p className="text-gray-700 text-base flex items-center mb-2">
                <FaInfoCircle className="mr-2" /> {orgDescription}
            </p>
            <p className="text-gray-700 text-base flex items-center mb-2">
                <FaPhone className="mr-2" /> {orgPhone}
            </p>
            <p className="text-gray-700 text-base flex items-center">
                <FaEnvelope className="mr-2" /> {orgEmail}
            </p>
        </div>
    );
};

export default OrgDetailsCard;