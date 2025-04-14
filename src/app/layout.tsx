import type { Metadata } from "next";
// Import Merriweather and Roboto
import { Merriweather, Roboto } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

// Instantiate Merriweather for sans and serif
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"], // Include desired weights
  variable: "--font-sans", // Assign to --font-sans
});

// Instantiate Roboto for mono
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"], // Include desired weights
  variable: "--font-mono", // Assign to --font-mono
});

export const metadata: Metadata = {
  title: "Gooks",
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
