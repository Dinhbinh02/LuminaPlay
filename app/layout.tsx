import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import PinOverlay from "@/components/auth/PinOverlay";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { ToastContainer } from "@/components/ui/Toast";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Lumina Play",
  description: "Watch your favorite movies and shows with Lumina Play.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LoadingScreen />
        <Providers>
          <PinOverlay />
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
