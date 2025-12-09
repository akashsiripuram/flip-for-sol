import type { Metadata } from "next";
import WalletContextProvider from "@/providers/WalletProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coin Flip Web3",
  description: "Solana coin flip app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
