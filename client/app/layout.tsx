import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import logo from "../public/white-logo.png";
import logoSEO from "../public/logo.png";
import openGraphImage from "../public/opengraphThin.png";
import {MeetingProvider} from "./context/MeetingContext";
import {AlertProvider} from "@/app/context/AlertContext";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Azion",
    description: "Azion - Improve your workflow and secure your company with Azion.",
    keywords: [
        "Azion",
        "organization",
        "security",
        "tasks",
        "workflow",
        "roles",
        "organisations",
        "azion",
        "face recognition"
    ],
    applicationName: "Azion",
    authors: [{name: "Azion Team", url: "https://azion.online"}],
    creator: "Azion Team",

    metadataBase: new URL("https://azion.online"), // Fix: Set metadataBase

    openGraph: {
        title: "Azion - Improve your workflow and secure your company with Azion.",
        description: "Azion is an advanced app for managing your organization's workflow, employees, tasks, and roles, and provides advanced security features.",
        url: "https://azion.online",
        siteName: "Azion",
        images: [
            {
                url: openGraphImage.src,
                width: 1200,
                height: 630,
                alt: "Azion Open Graph Image",
            },
        ],
        locale: "en_US",
        type: "website",
    },

    icons: {
        icon: logoSEO.src,
        shortcut: logoSEO.src,
    },

    alternates: {
        canonical: "https://azion.online"
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={"scroll-smooth"}>
        <head>
            <link rel="icon" href={logo.src}/>
        </head>
        <body className={`${inter.className} bg-background text-white overflow-x-hidden`}>
        <AlertProvider>
            <MeetingProvider>
                {children}
            </MeetingProvider>
        </AlertProvider>
        </body>
        </html>
    );
}