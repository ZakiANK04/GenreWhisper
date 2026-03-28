import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GenreWhisper | Book Review AI",
  description: "Unveiling Hidden Genres from the Whispers of Readers",
};

import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cinzel.variable} antialiased min-h-screen flex text-[#e6dfcc] bg-[#110e0c]`}>
        <Sidebar />
        <main className="flex-1 overflow-x-hidden min-h-screen pl-12 md:pl-0">
          {children}
        </main>
      </body>
    </html>
  );
}
