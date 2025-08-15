import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TTRPG Overlay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className="bg-[url(background.png)] bg-fixed text-gray-900 w-dvw h-dvh overflow-x-hidden">{children}</body>
    </html>
  );
}
