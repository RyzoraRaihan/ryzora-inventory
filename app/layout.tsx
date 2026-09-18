import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RYZORA Inventory",
  description:
    "RYZORA Inventory — Modern inventory, sales, purchase and business management system.",
  applicationName: "RYZORA Inventory",
  keywords: [
    "RYZORA",
    "RYZORA Inventory",
    "Inventory Management",
    "Business Management",
    "Sales",
    "Purchase",
    "Stock Management",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
