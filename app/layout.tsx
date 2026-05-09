import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import PinOverlay from "@/components/auth/PinOverlay";
import LoadingScreen from "@/components/layout/LoadingScreen";

export const metadata: Metadata = {
  title: "Lumina Play - Premium Streaming Experience",
  description: "Watch your favorite movies and shows with Lumina Play.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LoadingScreen />
        <Providers>
          <PinOverlay />
          {children}
        </Providers>
      </body>
    </html>
  );
}
