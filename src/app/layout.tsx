import type { Metadata } from "next";
import { Chivo } from "next/font/google";
import "./globals.css";

const chivoSans = Chivo({
  variable: "--font-chivo",
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
      <body className={`${chivoSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
