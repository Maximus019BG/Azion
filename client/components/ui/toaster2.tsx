"use client"

import {Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport} from "@/components/ui/toast2"
import {useToast} from "@/components/ui/use-toast2"

interface ToastType {
    id: string;
    title?: string;
    description?: React.ReactNode;
    action?: React.ReactNode;

    [key: string]: any;
}

export function Toaster() {
    const {toasts}: { toasts: ToastType[] } = useToast();

    return (
        <ToastProvider>
            {toasts.map(({id, title, description, action, ...props}: ToastType) => (
                <Toast key={id} {...props}>
                    <div className="grid gap-1">
                        {title && <ToastTitle>{title}</ToastTitle>}
                        {description && <ToastDescription>{description}</ToastDescription>}
                    </div>
                    {action}
                    <ToastClose/>
                </Toast>
            ))}
            <ToastViewport/>
        </ToastProvider>
    );
}