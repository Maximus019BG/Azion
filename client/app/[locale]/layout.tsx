import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "../globals.css";
import logo from "../../public/white-logo.png";
import openGraphImage from "../../public/opengraphThin.png";
import {MeetingProvider} from "../context/MeetingContext";
import {NextIntlClientProvider} from "next-intl";
import {getMessages} from "next-intl/server";

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

    metadataBase: new URL("https://azion.online"),

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
        icon: logo.src,
        shortcut: logo.src,
    },

    alternates: {
        canonical: "https://azion.online",
        languages: {
            "en-US": "https://azion.online/en-US",
            "es-ES": "https://azion.online/es-ES",
        },
    },
};

export default async function RootLayout({
                                             children,
                                             params,
                                         }: Readonly<{
    children: React.ReactNode;
    params: { locale?: string };
}>) {
    const {locale} = params;
    const messages = await getMessages({locale});
    return (
        <html lang={locale}>
        <head>
            <link rel="icon" href={logo.src}/>
        </head>
        <body className={`${inter.className} bg-background text-white overflow-x-hidden`}>
        <NextIntlClientProvider messages={messages}>
            <MeetingProvider>
                {children}
            </MeetingProvider>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}