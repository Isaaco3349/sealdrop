"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS, WRAPPER_ABI, ERC20_ABI } from "@/lib/contracts";

interface WrappedToken {
  original: string;
  wrapped: string;
  symbol: string;
  name: string;
  addedAt: number;
}

export default function RegistryTab() {
  const { address } = useAccount();
  const [wrapAmount, setWrapAmount] = useState("");
  const [status, setStatus] = useState("");

  const { writeContractAsync, isPending } = useWriteContract();

  // Read mock token balance
  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.MockERC20 as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address },
  });

  // Pre-seeded registry showing our deployed wrapper
  const [registry] = useState<WrappedToken[]>([
    {
      original: CONTRACTS.MockERC20,
      wrapped: CONTRACTS.ConfidentialWrapper,
      symbol: "ctUSDC",
      name: "Confidential tUSDC",
      addedAt: Date.now(),
    },
  ]);

  async function handleMint() {
    if (!address) return;
    setStatus("Minting test tokens...");
    try {
      const hash = await writeContractAsync({
        address: CONTRACTS.MockERC20 as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "mint",
        args: [address, parseUnits("1000", 18)],
        gas: 100000n,
      });
      setStatus(`✓ Minted 1000 tUSDC — tx: ${hash.slice(0, 10)}...`);
      setTimeout(() => refetchBalance(), 5000);
    } catch (e: any) {
      setStatus(`Error: ${e.shortMessage ?? e.message}`);
    }
  }

  async function handleWrap() {
    if (!address || !wrapAmount) return;
    setStatus("Step 1/2 — Approving tokens...");
    try {
      // The contract wrap() takes uint64 (raw small number, not 18-decimal)
      // But the ERC20 approve needs the 18-decimal amount
      const rawAmount = BigInt(wrapAmount); // e.g. 100n
      const scaledAmount = parseUnits(wrapAmount, 18); // for approve

      // Step 1: Approve
      const approveTx = await writeContractAsync({
        address: CONTRACTS.MockERC20 as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACTS.ConfidentialWrapper as `0x${string}`, scaledAmount],
        gas: 100000n,
      });
      setStatus(`Approval sent (${approveTx.slice(0, 10)}...) — waiting...`);
      await new Promise((r) => setTimeout(r, 6000));

      // Step 2: Wrap — passes raw uint64 to contract
      setStatus("Step 2/2 — Wrapping into confidential token...");
      const wrapTx = await writeContractAsync({
        address: CONTRACTS.ConfidentialWrapper as `0x${string}`,
        abi: WRAPPER_ABI,
        functionName: "wrap",
        args: [rawAmount],
        gas: 500000n,
      });
      setStatus(`✓ Wrapped ${wrapAmount} tUSDC → ctUSDC — tx: ${wrapTx.slice(0, 10)}...`);
      setWrapAmount("");
      setTimeout(() => refetchBalance(), 5000);
    } catch (e: any) {
      setStatus(`Error: ${e.shortMessage ?? e.message}`);
    }
  }

  async function handleUnwrap() {
    if (!address || !wrapAmount) return;
    setStatus("Unwrapping confidential tokens...");
    try {
      const hash = await writeContractAsync({
        address: CONTRACTS.ConfidentialWrapper as `0x${string}`,
        abi: WRAPPER_ABI,
        functionName: "unwrap",
        args: [BigInt(wrapAmount)],
        gas: 500000n,
      });
      setStatus(`✓ Unwrapped ${wrapAmount} ctUSDC → tUSDC — tx: ${hash.slice(0, 10)}...`);
      setWrapAmount("");
      setTimeout(() => refetchBalance(), 5000);
    } catch (e: any) {
      setStatus(`Error: ${e.shortMessage ?? e.message}`);
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

        .balance-row {
          font-size: 11px; color: #3a4050; margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }
        .balance-val { color: #00d2be; font-family: 'DM Mono', monospace; }

        .input-row {
          display: flex; gap: 10px; margin-bottom: 10px;
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

        .btn-row { display: flex; gap: 8px; }

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

        .unwrap-btn {
          background: rgba(99,60,255,0.15);
          border: 1px solid rgba(99,60,255,0.3);
          border-radius: 10px; padding: 12px 24px;
          color: #633cff; font-family: 'DM Mono', monospace;
          font-size: 11px; font-weight: 500; cursor: pointer;
          white-space: nowrap; letter-spacing: 0.05em;
          transition: opacity 0.15s;
        }
        .unwrap-btn:disabled { opacity: 0.4; cursor: default; }
        .unwrap-btn:not(:disabled):hover { opacity: 0.7; }

        .mint-btn {
          background: transparent;
          border: 1px solid rgba(0,210,190,0.3);
          border-radius: 8px; padding: 8px 16px;
          color: #00d2be; font-family: 'DM Mono', monospace;
          font-size: 10px; cursor: pointer;
          transition: opacity 0.15s;
        }
        .mint-btn:hover { opacity: 0.7; }

        .status-msg {
          font-size: 11px; color: #633cff;
          margin-top: 12px; letter-spacing: 0.05em;
          word-break: break-all;
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

        .live-tag {
          font-size: 8px; padding: 2px 7px;
          background: rgba(0,255,100,0.1);
          border: 1px solid rgba(0,255,100,0.2);
          border-radius: 3px; color: #00ff64;
          letter-spacing: 0.1em; text-transform: uppercase;
          margin-left: 4px;
        }

        .eip-note {
          background: rgba(0,210,190,0.04);
          border: 1px solid rgba(0,210,190,0.12);
          border-radius: 12px; padding: 16px 20px;
          margin-bottom: 32px;
          font-size: 11px; color: #3a4050; line-height: 1.7;
        }
        .eip-note strong { color: #00d2be; }

        .etherscan-link {
          font-size: 9px; color: #2a3040;
          text-decoration: none; letter-spacing: 0.05em;
        }
        .etherscan-link:hover { color: #633cff; }
      `}</style>

      <div className="section-title">Wrapper Registry</div>

      <div className="wrap-card">
        <h3>Wrap / Unwrap tUSDC</h3>
        <p>
          Convert tUSDC into confidential ctUSDC using FHE encryption on Sepolia.
          Balances are encrypted — only you can see your amount.
        </p>

        {address && (
          <div className="balance-row">
            tUSDC balance:&nbsp;
            <span className="balance-val">
              {tokenBalance ? (Number(tokenBalance) / 1e18).toFixed(2) : "0.00"}
            </span>
            <button className="mint-btn" onClick={handleMint} disabled={isPending}>
              + Mint 1000
            </button>
          </div>
        )}

        <div className="input-row">
          <input
            className="addr-input"
            value={wrapAmount}
            onChange={(e) => setWrapAmount(e.target.value)}
            placeholder="Amount to wrap / unwrap (e.g. 100)"
            type="number"
          />
        </div>
        <div className="btn-row">
          <button className="wrap-btn" onClick={handleWrap} disabled={isPending || !wrapAmount || !address}>
            {isPending ? "Pending..." : "Wrap →"}
          </button>
          <button className="unwrap-btn" onClick={handleUnwrap} disabled={isPending || !wrapAmount || !address}>
            ← Unwrap
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
                  <span className="live-tag">LIVE</span>
                </div>
                <div className="token-name">{token.name}</div>
              </div>
            </div>
            <div className="token-right">
              <div className="token-addr">
                {token.wrapped.slice(0, 10)}...{token.wrapped.slice(-6)}
              </div>
              <a
                className="etherscan-link"
                href={`https://sepolia.etherscan.io/address/${token.wrapped}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                view on etherscan ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
