import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/providers/NextAuthProvider";

// Load Poppins font
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});


export const metadata: Metadata = {
  title: "CalSync - Seamless Calendar Synchronization",
  description: "Sync your Google and Microsoft calendars effortlessly. Multiple accounts, real-time updates, and complete control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-poppins antialiased`}
      >
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}