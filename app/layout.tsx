import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PreloadResources } from "./preload-resources";

export const metadata: Metadata = {
  title: "Crazy Good — Coming Soon",
  description: "Join the Crazy Good community for early access.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf7f1",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PreloadResources />
        {children}
      </body>
    </html>
  );
}
