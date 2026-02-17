import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import JackpotNotifications from "@/components/JackpotNotifications";
import "@/styles/globals.css";
import MainHeader from "./mainHeader/mainheader";

export const metadata: Metadata = {
  title: "CasinoBit - Provably Fair Casino",
  description: "Play provably fair casino games with cryptocurrency",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen text-white" 
      style={{
      background:
        "radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 0%, rgba(8,8,25,1) 100%)",
    }}
    >
        <MainHeader />
        {children}
        <JackpotNotifications />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
