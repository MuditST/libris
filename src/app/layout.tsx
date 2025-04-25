import type { Metadata } from "next";

import { Merriweather, Roboto } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"], 
  variable: "--font-sans", 
});


const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"], 
  variable: "--font-mono", 
});

export const metadata: Metadata = {
  title: "Libris",
  description: "Your personal digital library.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html
        lang="en"
        className={`${merriweather.variable} ${roboto.variable} font-sans antialiased `}
        suppressHydrationWarning
      >
        <body>
          {children}
          <Toaster position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
