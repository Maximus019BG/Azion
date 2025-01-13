import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import MfaSetupModal from '../components/_MFA Pop Ups/Modals/MfaSetupModal';
import MfaRemoveModal from '../components/_MFA Pop Ups/Modals/MfaRemoveModal';

export const MfaButtons = () => {
    const [isMfaEnabled, setIsMfaEnabled] = useState<boolean>(false);
    const [isMfaModalOpen, setIsMfaModalOpen] = useState<boolean>(false);
    const [isMfaRemoveModalOpen, setIsMfaRemoveModalOpen] = useState<boolean>(false);

    return (
        <div
            className="w-fit h-full relative bg-base-300 rounded-xl flex flex-col justify-between p-8 text-white shadow-lg">
            {isMfaEnabled ? (
                <button
                    className="bg-gray-800 w-full mt-3 text-white hover:bg-gray-700 font-bold py-2 px-4 rounded"
                    onClick={() => setIsMfaRemoveModalOpen(true)}
                >
                    Remove 2FA
                </button>
            ) : (
                <button
                    className="bg-gray-800 w-full mt-3 text-white hover:bg-gray-700 font-bold py-2 px-4 rounded"
                    onClick={() => setIsMfaModalOpen(true)}
                >
                    Add 2FA
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