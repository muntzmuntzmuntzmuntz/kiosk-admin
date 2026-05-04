import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Manrope } from "next/font/google";
import { SiteHeader } from "./site-header";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: "500",
});

export const metadata: Metadata = {
  title: "Binate",
  description:
    "Systems built within two states.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${manrope.className} h-full antialiased`}>
        <body className="min-h-full flex flex-col">
          <SiteHeader />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
