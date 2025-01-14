"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import Alert from "@/app/components/Alert";

type AlertContextType = {
    showAlert: (message: string, type?: "success" | "error") => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useCustomAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error("useCustomAlert must be used within CustomAlertProvider");
    }
    return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alert, setAlert] = useState<{ message: string; type: string } | null>(null);

    const showAlert = (message: string, type: "success" | "error" = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000); // Auto-hide after 3 seconds
    };

    // Override the global alert function
    (window as any).alert = showAlert;

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            {alert && (
                <Alert
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert(null)}
                />
            )}
        </AlertContext.Provider>
    );
};
