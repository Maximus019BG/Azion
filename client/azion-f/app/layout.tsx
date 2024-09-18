import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import logo from "../public/white-logo.png"


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Azion",
  description: "Azion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={logo.src} />
      </head>
      <body className={` ${inter.className} bg-background text-white overflow-x-hidden  `}>
        {children}
      </body>
    </html>
  );
}
