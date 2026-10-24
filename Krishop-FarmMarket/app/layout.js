import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";
import { ToastContainer } from "react-toastify";
import Header from "@/Components/Header";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "KriShop | Fair produce marketplace",
    description: "KriShop connects farmers and buyers through fair, transparent produce trading.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ToastContainer />
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
