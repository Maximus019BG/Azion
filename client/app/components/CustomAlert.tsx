import React from "react";

interface CustomAlertProps {
    message: string;
    onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({message, onClose}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div
                className="bg-gray-900 shadow-2xl border-2 border-gray-700 w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 h-auto p-6 flex flex-col justify-center items-center rounded">
                <p className="text-white font-semibold text-xl text-center">{message}</p>
                <button
                    onClick={onClose}
                    className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 w-32 rounded"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default CustomAlert;