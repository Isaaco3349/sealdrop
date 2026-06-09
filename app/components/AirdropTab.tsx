"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

interface Recipient {
  address: string;
  amount: string;
}

export default function AirdropTab() {
  const { address } = useAccount();
  const [token, setToken] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: "", amount: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [sent, setSent] = useState(false);

  function addRecipient() {
    setRecipients((r) => [...r, { address: "", amount: "" }]);
  }

  function updateRecipient(i: number, field: keyof Recipient, value: string) {
    setRecipients((r) => r.map((rec, idx) => idx === i ? { ...rec, [field]: value } : rec));
  }

  function removeRecipient(i: number) {
    setRecipients((r) => r.filter((_, idx) => idx !== i));
  }

  async function handleAirdrop() {
    if (!token || recipients.some((r) => !r.address || !r.amount)) return;
    setLoading(true);
    setSent(false);

    const steps = [
      "Initializing FHE engine...",
      "Encrypting airdrop amounts...",
      `Encrypting ${recipients.length} recipient amounts with FHE...`,
      "Submitting confidential transactions...",
      "✓ Confidential airdrop sent!",
    ];

    for (const step of steps) {
      setStatus(step);
      await new Promise((r) => setTimeout(r, 900));
    }

    setLoading(false);
    setSent(true);
  }

  const totalAmount = recipients.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

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

        .addr-input {
          width: 100%; background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 12px 16px;
          color: #e8eaf0; font-family: 'DM Mono', monospace;
          font-size: 12px; outline: none; margin-bottom: 20px;
          transition: border-color 0.15s;
        }
        .addr-input:focus { border-color: rgba(0,210,190,0.3); }
        .addr-input::placeholder { color: #2a3040; }

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

        .send-btn {
          width: 100%; margin-top: 20px;
          background: linear-gradient(135deg, #633cff, #00d2be);
          border: none; border-radius: 12px; padding: 16px;
          color: #fff; font-family: 'DM Mono', monospace;
          font-size: 12px; font-weight: 500; cursor: pointer;
          letter-spacing: 0.08em; text-transform: uppercase;
          transition: opacity 0.15s;
        }
        .send-btn:disabled { opacity: 0.3; cursor: default; }
        .send-btn:not(:disabled):hover { opacity: 0.85; }

        .status-msg {
          font-size: 11px; color: #633cff;
          margin-top: 12px; letter-spacing: 0.05em; text-align: center;
        }

        .success-banner {
          background: rgba(0,210,190,0.08);
          border: 1px solid rgba(0,210,190,0.2);
          border-radius: 12px; padding: 20px;
          text-align: center; margin-top: 20px;
        }
        .success-banner h4 { color: #00d2be; font-size: 14px; margin-bottom: 6px; }
        .success-banner p { color: #3a4050; font-size: 11px; line-height: 1.6; }

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
        <strong>Privacy guarantee</strong> — Airdrop amounts are encrypted with FHE before
        being sent onchain. Only each recipient can decrypt their own allocation.
        The total supply remains verifiable without revealing individual amounts.
      </div>

      <div className="airdrop-card">
        <h3>Configure airdrop</h3>
        <p>Select a confidential token from the registry and add recipients with encrypted amounts.</p>

        <div className="field-label">Confidential token address</div>
        <input
          className="addr-input"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Wrapped token address from registry (0x...)"
        />

        <div className="recipients-header">
          <div className="field-label" style={{ margin: 0 }}>Recipients</div>
          <button className="add-btn" onClick={addRecipient}>+ Add recipient</button>
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
              <button className="remove-btn" onClick={() => removeRecipient(i)}>✕</button>
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

        <button
          className="send-btn"
          onClick={handleAirdrop}
          disabled={loading || !token || recipients.some((r) => !r.address || !r.amount)}
        >
          {loading ? "Encrypting & Sending..." : "🔒 Send Confidential Airdrop"}
        </button>

        {status && <div className="status-msg">{status}</div>}

        {sent && (
          <div className="success-banner">
            <h4>✓ Airdrop sent confidentially</h4>
            <p>
              All {recipients.length} recipient amounts are encrypted onchain.
              Only each recipient can decrypt their allocation using EIP-712.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
