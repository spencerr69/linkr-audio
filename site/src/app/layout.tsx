// noinspection HtmlRequiredTitleElement

import type { Metadata } from "next";
import { Chivo, Chivo_Mono } from "next/font/google";
import "./globals.css";
import React from "react";

const chivoSans = Chivo({
  variable: "--font-chivo",
  subsets: ["latin"],
});

const chivoMono = Chivo_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "linkr-audio",
  description: "",
  icons: {
    icon: "/linkraudio.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body
        className={`${chivoSans.variable} ${chivoMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
