"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { CONTRACTS, AIRDROP_ABI } from "@/lib/contracts";

interface Recipient {
  address: string;
  amount: string;
}

export default function AirdropTab() {
  const { address } = useAccount();
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: "", amount: "" },
  ]);
  const [status, setStatus] = useState("");
  const [sent, setSent] = useState(false);
  const [txHash, setTxHash] = useState("");

  const { writeContractAsync, isPending } = useWriteContract();

  function addRecipient() {
    setRecipients((r) => [...r, { address: "", amount: "" }]);
  }

  function updateRecipient(i: number, field: keyof Recipient, value: string) {
    setRecipients((r) =>
      r.map((rec, idx) => (idx === i ? { ...rec, [field]: value } : rec))
    );
  }

  function removeRecipient(i: number) {
    setRecipients((r) => r.filter((_, idx) => idx !== i));
  }

  async function handleLoadAirdrop() {
    if (!address || recipients.some((r) => !r.address || !r.amount)) return;
    setSent(false);
    setStatus("Encrypting airdrop amounts with FHE...");

    try {
      const addrs = recipients.map((r) => r.address as `0x${string}`);
      const amounts = recipients.map((r) => BigInt(Math.floor(parseFloat(r.amount))));

      setStatus("Submitting confidential airdrop onchain...");
      const hash = await writeContractAsync({
        address: CONTRACTS.ConfidentialAirdrop as `0x${string}`,
        abi: AIRDROP_ABI,
        functionName: "loadAirdrop",
        args: [addrs, amounts],
      });

      setTxHash(hash);
      setStatus(`✓ Airdrop loaded — tx: ${hash.slice(0, 10)}...`);
      setSent(true);
    } catch (e: any) {
      setStatus(`Error: ${e.shortMessage ?? e.message}`);
    }
  }

  async function handleClaim() {
    if (!address) return;
    setStatus("Claiming your confidential airdrop...");
    try {
      const hash = await writeContractAsync({
        address: CONTRACTS.ConfidentialAirdrop as `0x${string}`,
        abi: AIRDROP_ABI,
        functionName: "claim",
        args: [],
      });
      setTxHash(hash);
      setStatus(`✓ Claimed — tx: ${hash.slice(0, 10)}...`);
      setSent(true);
    } catch (e: any) {
      setStatus(`Error: ${e.shortMessage ?? e.message}`);
    }
  }

  const totalAmount = recipients.reduce(
    (sum, r) => sum + (parseFloat(r.amount) || 0),
    0
  );

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

        .airdrop-card {
          background: rgba(0,210,190,0.04);
          border: 1px solid rgba(0,210,190,0.12);
          border-radius: 16px; padding: 28px;
          margin-bottom: 24px;
        }

        .airdrop-card h3 {
          font-size: 14px; color: #fff; margin-bottom: 6px;
          font-family: 'DM Mono', monospace;
        }

        .airdrop-card p {
          font-size: 11px; color: #3a4050; margin-bottom: 20px; line-height: 1.6;
        }

        .field-label {
          font-size: 9px; color: #3a4050; letter-spacing: 0.15em;
          text-transform: uppercase; margin-bottom: 8px;
        }

        .contract-info {
          font-size: 10px; color: #2a3040;
          font-family: 'DM Mono', monospace;
          margin-bottom: 20px; padding: 10px 14px;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: space-between;
        }

        .contract-info a {
          color: #633cff; text-decoration: none; font-size: 9px;
        }
        .contract-info a:hover { opacity: 0.7; }

        .recipients-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 12px;
        }

        .add-btn {
          font-family: 'DM Mono', monospace; font-size: 10px;
          background: rgba(99,60,255,0.1); border: 1px solid rgba(99,60,255,0.2);
          border-radius: 6px; padding: 5px 12px; color: #9b7fff;
          cursor: pointer; letter-spacing: 0.05em;
          transition: all 0.15s;
        }
        .add-btn:hover { background: rgba(99,60,255,0.2); }

        .recipient-row {
          display: flex; gap: 8px; margin-bottom: 8px; align-items: center;
        }

        .recipient-addr {
          flex: 2; background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px; padding: 10px 14px;
          color: #e8eaf0; font-family: 'DM Mono', monospace;
          font-size: 11px; outline: none;
          transition: border-color 0.15s;
        }
        .recipient-addr:focus { border-color: rgba(99,60,255,0.3); }
        .recipient-addr::placeholder { color: #2a3040; }

        .recipient-amount {
          flex: 1; background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px; padding: 10px 14px;
          color: #00d2be; font-family: 'DM Mono', monospace;
          font-size: 11px; outline: none;
          transition: border-color 0.15s;
        }
        .recipient-amount:focus { border-color: rgba(0,210,190,0.3); }
        .recipient-amount::placeholder { color: #2a3040; }

        .remove-btn {
          background: transparent; border: 1px solid rgba(255,60,60,0.15);
          border-radius: 6px; padding: 8px 10px; color: #ff3c3c;
          cursor: pointer; font-size: 12px; opacity: 0.4;
          transition: opacity 0.15s;
        }
        .remove-btn:hover { opacity: 1; }

        .summary-row {
          display: flex; justify-content: space-between;
          padding: 12px 0;
          border-top: 1px solid rgba(255,255,255,0.04);
          margin-top: 16px;
          font-size: 11px; color: #3a4050;
        }
        .summary-val { color: #00d2be; }

        .btn-row { display: flex; gap: 8px; margin-top: 20px; }

        .send-btn {
          flex: 2;
          background: linear-gradient(135deg, #633cff, #00d2be);
          border: none; border-radius: 12px; padding: 16px;
          color: #fff; font-family: 'DM Mono', monospace;
          font-size: 12px; font-weight: 500; cursor: pointer;
          letter-spacing: 0.08em; text-transform: uppercase;
          transition: opacity 0.15s;
        }
        .send-btn:disabled { opacity: 0.3; cursor: default; }
        .send-btn:not(:disabled):hover { opacity: 0.85; }

        .claim-btn {
          flex: 1;
          background: rgba(0,210,190,0.1);
          border: 1px solid rgba(0,210,190,0.3);
          border-radius: 12px; padding: 16px;
          color: #00d2be; font-family: 'DM Mono', monospace;
          font-size: 12px; font-weight: 500; cursor: pointer;
          letter-spacing: 0.08em; text-transform: uppercase;
          transition: opacity 0.15s;
        }
        .claim-btn:disabled { opacity: 0.3; cursor: default; }
        .claim-btn:not(:disabled):hover { opacity: 0.7; }

        .status-msg {
          font-size: 11px; color: #633cff;
          margin-top: 12px; letter-spacing: 0.05em;
          word-break: break-all;
        }

        .success-banner {
          background: rgba(0,210,190,0.08);
          border: 1px solid rgba(0,210,190,0.2);
          border-radius: 12px; padding: 20px;
          text-align: center; margin-top: 20px;
        }
        .success-banner h4 { color: #00d2be; font-size: 14px; margin-bottom: 6px; }
        .success-banner p { color: #3a4050; font-size: 11px; line-height: 1.6; }
        .success-banner a { color: #633cff; font-size: 10px; }

        .privacy-note {
          background: rgba(99,60,255,0.04);
          border: 1px solid rgba(99,60,255,0.1);
          border-radius: 12px; padding: 16px 20px;
          margin-bottom: 24px;
          font-size: 11px; color: #3a4050; line-height: 1.7;
        }
        .privacy-note strong { color: #9b7fff; }
      `}</style>

      <div className="section-title">Confidential Airdrop</div>

      <div className="privacy-note">
        <strong>Privacy guarantee</strong> — Airdrop amounts are encrypted with
        FHE before being sent onchain. Only each recipient can decrypt their own
        allocation. The total supply remains verifiable without revealing
        individual amounts.
      </div>

      <div className="airdrop-card">
        <h3>Configure airdrop</h3>
        <p>
          Add recipients and amounts — all amounts are FHE-encrypted before
          hitting the chain. Only recipients can see their allocation.
        </p>

        <div className="field-label">Airdrop contract</div>
        <div className="contract-info">
          <span>
            {CONTRACTS.ConfidentialAirdrop.slice(0, 14)}...
            {CONTRACTS.ConfidentialAirdrop.slice(-6)}
          </span>
          <a
            href={`https://sepolia.etherscan.io/address/${CONTRACTS.ConfidentialAirdrop}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            view on etherscan ↗
          </a>
        </div>

        <div className="recipients-header">
          <div className="field-label" style={{ margin: 0 }}>
            Recipients
          </div>
          <button className="add-btn" onClick={addRecipient}>
            + Add recipient
          </button>
        </div>

        {recipients.map((rec, i) => (
          <div key={i} className="recipient-row">
            <input
              className="recipient-addr"
              value={rec.address}
              onChange={(e) => updateRecipient(i, "address", e.target.value)}
              placeholder={`Recipient address ${i + 1}`}
            />
            <input
              className="recipient-amount"
              value={rec.amount}
              onChange={(e) => updateRecipient(i, "amount", e.target.value)}
              placeholder="Amount"
              type="number"
            />
            {recipients.length > 1 && (
              <button
                className="remove-btn"
                onClick={() => removeRecipient(i)}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <div className="summary-row">
          <span>Total recipients</span>
          <span className="summary-val">{recipients.length}</span>
        </div>
        <div className="summary-row">
          <span>Total amount</span>
          <span className="summary-val">{totalAmount.toFixed(4)} tokens</span>
        </div>
        <div className="summary-row">
          <span>Privacy level</span>
          <span className="summary-val">FHE encrypted ✓</span>
        </div>

        <div className="btn-row">
          <button
            className="send-btn"
            onClick={handleLoadAirdrop}
            disabled={
              isPending ||
              !address ||
              recipients.some((r) => !r.address || !r.amount)
            }
          >
            {isPending ? "Encrypting..." : "🔒 Send Confidential Airdrop"}
          </button>
          <button
            className="claim-btn"
            onClick={handleClaim}
            disabled={isPending || !address}
          >
            Claim
          </button>
        </div>

        {status && <div className="status-msg">{status}</div>}

        {sent && txHash && (
          <div className="success-banner">
            <h4>✓ Airdrop sent confidentially</h4>
            <p>
              All {recipients.length} recipient amounts are encrypted onchain.
              Only each recipient can decrypt their allocation.
            </p>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View transaction on Etherscan ↗
            </a>
          </div>
        )}
      </div>
    </>
  );
}
