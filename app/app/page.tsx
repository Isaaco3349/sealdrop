"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import RegistryTab from "@/components/RegistryTab";
import AirdropTab from "@/components/AirdropTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"registry" | "airdrop">("registry");
  const { isConnected } = useAccount();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Clash+Display:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Clash+Grotesk:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #03050a;
          color: #e8eaf0;
          font-family: 'DM Mono', monospace;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .bg-mesh {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 70% 50% at 20% 10%, rgba(99,60,255,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(0,210,190,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 60% 30%, rgba(255,60,120,0.05) 0%, transparent 50%);
        }

        .scanlines {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
        }

        .shell {
          position: relative; z-index: 1;
          max-width: 1000px; margin: 0 auto;
          padding: 0 24px;
        }

        .header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 28px 0 24px;
          border-bottom: 1px solid rgba(99,60,255,0.15);
        }

        .logo-wrap { display: flex; align-items: center; gap: 14px; }

        .logo-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, #633cff 0%, #00d2be 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }

        .logo-name {
          font-family: 'DM Mono', monospace;
          font-size: 20px; font-weight: 500;
          color: #fff; letter-spacing: -0.5px;
        }

        .logo-tag {
          font-size: 9px; color: #633cff;
          letter-spacing: 0.2em; text-transform: uppercase;
          margin-top: 2px;
        }

        .header-right { display: flex; align-items: center; gap: 12px; }

        .zama-badge {
          font-size: 9px; padding: 4px 10px;
          background: rgba(99,60,255,0.1);
          border: 1px solid rgba(99,60,255,0.25);
          border-radius: 4px; color: #9b7fff;
          letter-spacing: 0.15em; text-transform: uppercase;
        }

        /* RainbowKit button override */
        .header-right button {
          font-family: 'DM Mono', monospace !important;
          font-size: 11px !important;
          background: linear-gradient(135deg, #633cff, #00d2be) !important;
          border-radius: 8px !important;
          border: none !important;
        }

        .hero {
          padding: 56px 0 40px;
          text-align: center;
        }

        .hero-eyebrow {
          font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase;
          color: #633cff; margin-bottom: 16px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        .hero-eyebrow::before,
        .hero-eyebrow::after {
          content: ''; width: 32px; height: 1px;
          background: rgba(99,60,255,0.4);
        }

        .hero-title {
          font-family: 'DM Mono', monospace;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 500; line-height: 1.1;
          color: #fff; margin-bottom: 16px;
          letter-spacing: -1px;
        }

        .hero-title span {
          background: linear-gradient(135deg, #633cff, #00d2be);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .hero-sub {
          font-size: 13px; color: #5a6070; line-height: 1.7;
          max-width: 480px; margin: 0 auto 40px;
        }

        .stats-row {
          display: flex; justify-content: center; gap: 40px;
          padding: 24px 0;
          border-top: 1px solid rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          margin-bottom: 48px;
        }

        .stat { text-align: center; }
        .stat-val {
          font-size: 22px; font-weight: 500; color: #fff;
          font-family: 'DM Mono', monospace;
        }
        .stat-val.purple { color: #633cff; }
        .stat-val.teal { color: #00d2be; }
        .stat-label {
          font-size: 9px; color: #3a4050;
          letter-spacing: 0.15em; text-transform: uppercase;
          margin-top: 4px;
        }

        .tabs {
          display: flex; gap: 2px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px; padding: 4px;
          margin-bottom: 32px; width: fit-content;
        }

        .tab-btn {
          font-family: 'DM Mono', monospace;
          font-size: 11px; padding: 9px 24px;
          border-radius: 7px; border: none; cursor: pointer;
          letter-spacing: 0.08em; text-transform: uppercase;
          transition: all 0.15s;
          background: transparent; color: #3a4050;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #633cff, #00d2be);
          color: #fff;
        }

        .tab-btn:not(.active):hover { color: #9b7fff; }

        .not-connected {
          text-align: center; padding: 80px 0;
          color: #3a4050; font-size: 12px;
          letter-spacing: 0.1em;
        }

        .not-connected-icon { font-size: 40px; margin-bottom: 16px; opacity: 0.3; }
      `}</style>

      <div className="bg-mesh" />
      <div className="scanlines" />

      <div className="shell">
        <header className="header">
          <div className="logo-wrap">
            <div className="logo-icon">🔒</div>
            <div>
              <div className="logo-name">SealDrop</div>
              <div className="logo-tag">FHE-Powered Confidential Tokens</div>
            </div>
          </div>
          <div className="header-right">
            <span className="zama-badge">Zama Season 3</span>
            <ConnectButton />
          </div>
        </header>

        <div className="hero">
          <div className="hero-eyebrow">Powered by FHEVM</div>
          <h1 className="hero-title">
            Confidential tokens.<br />
            <span>Encrypted by default.</span>
          </h1>
          <p className="hero-sub">
            Wrap any ERC20 into a confidential version using Fully Homomorphic Encryption.
            Send airdrops where only recipients can see their amounts.
          </p>

          <div className="stats-row">
            <div className="stat">
              <div className="stat-val purple">FHE</div>
              <div className="stat-label">Encryption</div>
            </div>
            <div className="stat">
              <div className="stat-val">Sepolia</div>
              <div className="stat-label">Network</div>
            </div>
            <div className="stat">
              <div className="stat-val teal">EIP-712</div>
              <div className="stat-label">Decryption</div>
            </div>
            <div className="stat">
              <div className="stat-val">3</div>
              <div className="stat-label">Zama Tracks</div>
            </div>
          </div>

          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === "registry" ? "active" : ""}`}
              onClick={() => setActiveTab("registry")}
            >
              🗂 Wrapper Registry
            </button>
            <button
              className={`tab-btn ${activeTab === "airdrop" ? "active" : ""}`}
              onClick={() => setActiveTab("airdrop")}
            >
              🪂 Confidential Airdrop
            </button>
          </div>
        </div>

        {!isConnected ? (
          <div className="not-connected">
            <div className="not-connected-icon">🔐</div>
            <div>Connect your wallet to get started</div>
          </div>
        ) : (
          <>
            {activeTab === "registry" && <RegistryTab />}
            {activeTab === "airdrop" && <AirdropTab />}
          </>
        )}
      </div>
    </>
  );
}
