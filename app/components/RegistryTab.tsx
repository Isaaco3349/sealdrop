"use client";

import { useState } from "react";
import { useAccount, usePublicClient } from "wagmi";

interface WrappedToken {
  original: string;
  wrapped: string;
  symbol: string;
  name: string;
  addedAt: number;
}

export default function RegistryTab() {
  const { address } = useAccount();
  const [tokenAddress, setTokenAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [registry, setRegistry] = useState<WrappedToken[]>([
    {
      original: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      wrapped: "0x" + "a".repeat(40),
      symbol: "cUSDC",
      name: "Confidential USDC",
      addedAt: Date.now() - 86400000,
    },
    {
      original: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
      wrapped: "0x" + "b".repeat(40),
      symbol: "cWETH",
      name: "Confidential WETH",
      addedAt: Date.now() - 3600000,
    },
  ]);

  async function handleWrap() {
    if (!tokenAddress || !address) return;
    setLoading(true);
    setStatus("Initializing FHE engine...");

    try {
      // Simulate FHE wrapping flow
      await new Promise((r) => setTimeout(r, 1000));
      setStatus("Generating encryption keys...");
      await new Promise((r) => setTimeout(r, 800));
      setStatus("Deploying confidential wrapper...");
      await new Promise((r) => setTimeout(r, 1200));

      const newToken: WrappedToken = {
        original: tokenAddress,
        wrapped: "0x" + Math.random().toString(16).slice(2).padEnd(40, "0"),
        symbol: "c" + tokenAddress.slice(2, 6).toUpperCase(),
        name: "Confidential " + tokenAddress.slice(0, 8) + "...",
        addedAt: Date.now(),
      };

      setRegistry((r) => [newToken, ...r]);
      setStatus("✓ Confidential wrapper deployed!");
      setTokenAddress("");
    } catch {
      setStatus("Error: deployment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .section-title {
          font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
          color: #633cff; margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-title::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(99,60,255,0.15);
        }

        .wrap-card {
          background: rgba(99,60,255,0.05);
          border: 1px solid rgba(99,60,255,0.15);
          border-radius: 16px; padding: 28px;
          margin-bottom: 32px;
        }

        .wrap-card h3 {
          font-size: 14px; color: #fff; margin-bottom: 6px;
          font-family: 'DM Mono', monospace;
        }

        .wrap-card p {
          font-size: 11px; color: #3a4050; margin-bottom: 20px;
          line-height: 1.6;
        }

        .input-row {
          display: flex; gap: 10px;
        }

        .addr-input {
          flex: 1; background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 12px 16px;
          color: #e8eaf0; font-family: 'DM Mono', monospace;
          font-size: 12px; outline: none;
          transition: border-color 0.15s;
        }
        .addr-input:focus { border-color: rgba(99,60,255,0.4); }
        .addr-input::placeholder { color: #2a3040; }

        .wrap-btn {
          background: linear-gradient(135deg, #633cff, #00d2be);
          border: none; border-radius: 10px; padding: 12px 24px;
          color: #fff; font-family: 'DM Mono', monospace;
          font-size: 11px; font-weight: 500; cursor: pointer;
          white-space: nowrap; letter-spacing: 0.05em;
          transition: opacity 0.15s;
        }
        .wrap-btn:disabled { opacity: 0.4; cursor: default; }
        .wrap-btn:not(:disabled):hover { opacity: 0.85; }

        .status-msg {
          font-size: 11px; color: #633cff;
          margin-top: 12px; letter-spacing: 0.05em;
        }

        .registry-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 48px; }

        .token-row {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px; padding: 16px 20px;
          transition: border-color 0.15s;
        }
        .token-row:hover { border-color: rgba(99,60,255,0.2); }

        .token-left { display: flex; align-items: center; gap: 14px; }

        .token-icon {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, rgba(99,60,255,0.3), rgba(0,210,190,0.3));
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
        }

        .token-symbol { font-size: 14px; color: #fff; font-weight: 500; }
        .token-name { font-size: 10px; color: #3a4050; margin-top: 2px; letter-spacing: 0.05em; }

        .token-right { text-align: right; }
        .token-addr { font-size: 10px; color: #2a3040; font-family: 'DM Mono', monospace; }
        .token-time { font-size: 9px; color: #1a2030; margin-top: 3px; }

        .fhe-tag {
          font-size: 8px; padding: 2px 7px;
          background: rgba(0,210,190,0.1);
          border: 1px solid rgba(0,210,190,0.2);
          border-radius: 3px; color: #00d2be;
          letter-spacing: 0.1em; text-transform: uppercase;
          margin-left: 8px;
        }

        .eip-note {
          background: rgba(0,210,190,0.04);
          border: 1px solid rgba(0,210,190,0.12);
          border-radius: 12px; padding: 16px 20px;
          margin-bottom: 32px;
          font-size: 11px; color: #3a4050; line-height: 1.7;
        }
        .eip-note strong { color: #00d2be; }
      `}</style>

      <div className="section-title">Wrapper Registry</div>

      <div className="wrap-card">
        <h3>Wrap an ERC20 token</h3>
        <p>
          Deploy a confidential wrapper for any ERC20. Balances are encrypted using FHE —
          only the owner can decrypt via EIP-712 signed request.
        </p>
        <div className="input-row">
          <input
            className="addr-input"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="ERC20 token address (0x...)"
          />
          <button className="wrap-btn" onClick={handleWrap} disabled={loading || !tokenAddress}>
            {loading ? "Wrapping..." : "Wrap →"}
          </button>
        </div>
        {status && <div className="status-msg">{status}</div>}
      </div>

      <div className="eip-note">
        <strong>EIP-712 Decryption</strong> — To view your encrypted balance, sign a structured
        decryption request. The FHEVM gateway verifies your signature and returns the plaintext
        only to you. No one else can read it.
      </div>

      <div className="section-title">Registered Wrappers</div>

      <div className="registry-list">
        {registry.map((token, i) => (
          <div key={i} className="token-row">
            <div className="token-left">
              <div className="token-icon">🔒</div>
              <div>
                <div className="token-symbol">
                  {token.symbol}
                  <span className="fhe-tag">FHE</span>
                </div>
                <div className="token-name">{token.name}</div>
              </div>
            </div>
            <div className="token-right">
              <div className="token-addr">
                {token.wrapped.slice(0, 10)}...{token.wrapped.slice(-6)}
              </div>
              <div className="token-time">
                {new Date(token.addedAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
