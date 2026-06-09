import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "@rainbow-me/rainbowkit/styles.css";

export const metadata: Metadata = {
  title: "SealDrop — Confidential Token Registry & Airdrop",
  description: "Wrap any ERC20 into a confidential token using FHE. Send encrypted airdrops on Sepolia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0, background: "#03050a" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
