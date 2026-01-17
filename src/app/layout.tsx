import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "@/components/AppWalletProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lynq | The Private Communication Layer",
  description: "End-to-end encrypted messaging and confidential payments on Solana. Connect your wallet to experience the future of secure communication.",
  keywords: ["Solana", "Encrypted Messaging", "Privacy", "Confidential Payments", "Web3", "Blockchain", "Chat"],
  openGraph: {
    title: "Lynq | The Private Communication Layer",
    description: "End-to-end encrypted messaging and confidential payments on Solana.",
    url: "https://lynqprotocol.com",
    siteName: "Lynq",
    type: "website",
    images: [
      {
        url: "/logo-text.png",
        width: 1200,
        height: 630,
        alt: "Lynq - Private Communication Layer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lynq | The Private Communication Layer",
    description: "End-to-end encrypted messaging and confidential payments on Solana.",
    images: ["/logo-text.png"],
  },
  icons: {
    icon: "/logo_icon.png",
    shortcut: "/logo_icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <AppWalletProvider>{children}</AppWalletProvider>
      </body>
    </html>
  );
}
