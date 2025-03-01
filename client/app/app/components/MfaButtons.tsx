import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import MfaSetupModal from '../components/_MFA Pop Ups/Modals/MfaSetupModal';
import MfaRemoveModal from '../components/_MFA Pop Ups/Modals/MfaRemoveModal';

interface MfaButtonsProps {
    isMfaEnabled: boolean;
}

export const MfaButtons: React.FC<MfaButtonsProps> = ({ isMfaEnabled }) =>{
    const [isMfaModalOpen, setIsMfaModalOpen] = useState<boolean>(false);
    const [isMfaRemoveModalOpen, setIsMfaRemoveModalOpen] = useState<boolean>(false);

    return (
        <div
            className="w-full h-fit relative flex flex-col justify-between text-white">
            {isMfaEnabled ? (
                <button
                    className="bg-gray-800 w-full text-white hover:bg-gray-700 font-bold transition duration-200 ease-in-out py-2 px-4 rounded"
                    onClick={() => setIsMfaRemoveModalOpen(true)}
                >
                    Disable 2FA
                </button>
            ) : (
                <button
                    className="bg-gray-800 w-full text-white hover:bg-gray-700 transition duration-200 ease-in-out font-bold py-2 px-4 rounded"
                    onClick={() => setIsMfaModalOpen(true)}
                >
                    Enable 2FA
                </button>
            )}
            {isMfaModalOpen && ReactDOM.createPortal(
                <MfaSetupModal isOpen={isMfaModalOpen} onClose={() => setIsMfaModalOpen(false)}/>,
                document.body
            )}
            {isMfaRemoveModalOpen && ReactDOM.createPortal(
                <MfaRemoveModal isOpen={isMfaRemoveModalOpen} onClose={() => setIsMfaRemoveModalOpen(false)}/>,
                document.body
            )}
        </div>
    );
};