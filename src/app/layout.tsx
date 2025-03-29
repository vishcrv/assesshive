import { ThemeProvider } from "./components/theme-provider";
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";

export const inter = Inter({ subsets: ['latin'] });



export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`} 
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            
        {children}
        <Toaster />
        </ThemeProvider>  
      </body>
      
    </html>
    </ClerkProvider>
  );
}
