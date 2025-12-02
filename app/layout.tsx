import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../src/styles/globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PredictBack - Prediction Market",
  description: "A Polymarket-like prediction market platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-gray-950 pt-[4.5rem]">
          {children}
        </main>
        <Toaster position="top-right" theme="dark" />
      </body>
    </html>
  );
}

