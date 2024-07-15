import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import logo from "../public/logo.png"
import Navbar from "./components/Navbar";


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
      <body className={` ${inter.className} bg-[#f7f3e8]`}>
        {children}
      </body>
    </html>
  );
}
