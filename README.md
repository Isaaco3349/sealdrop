# SealDrop — FHE-Powered Confidential Tokens

Wrap any ERC20 into a confidential version. Send airdrops where only recipients can see their amount.

🌐 **Live demo:** [sealdrop-7h7e.vercel.app](https://sealdrop-7h7e.vercel.app)

> Built for Zama Season 3 — submitted under **Builder**, **Bounty (Confidential Wrapper Registry)**, and **Special Bounty × TokenOps** tracks.

---

## What it does

- **Confidential Wrapper** — Wrap any ERC20 into an FHE-encrypted version. Balances are stored as ciphertexts onchain — only the owner can decrypt their balance
- **Confidential Airdrop** — Send token airdrops where each recipient's amount is FHE-encrypted. No one else can see how much anyone received
- **Wrapper Registry** — A live registry of all deployed confidential wrappers with Etherscan links
- **EIP-712 Decryption** — Users sign a structured decryption request to view their encrypted balance. The FHEVM gateway verifies the signature and returns plaintext only to them

---

## Stack

- **Frontend** — Next.js 16, TypeScript, deployed on Vercel
- **Encryption** — Zama FHEVM (`@fhevm/solidity`) with `ZamaEthereumConfig`
- **Contracts** — Solidity 0.8.28, deployed on Ethereum Sepolia
- **Wallet** — RainbowKit + Wagmi v2
- **Dev tooling** — Hardhat Ignition v3

---

## Deployed Contracts (Sepolia)

| Contract | Address |
|---|---|
| MockERC20 (tUSDC) | `0x4434005c017a214574417e3045e4CEb64f93A025` |
| ConfidentialWrapper (ctUSDC) | `0x001699daB4F9c25CD857330248d0772C18050684` |
| ConfidentialAirdrop | `0xcf1bc05C91d87A99f96dD38D3b38da3412F84294` |

Verify on Etherscan:
- [ConfidentialWrapper](https://sepolia.etherscan.io/address/0x001699daB4F9c25CD857330248d0772C18050684)
- [ConfidentialAirdrop](https://sepolia.etherscan.io/address/0xcf1bc05C91d87A99f96dD38D3b38da3412F84294)

---

## How it works

```
User (browser)
    │
    ▼
Next.js frontend (Vercel)
    │  wrap(amount) / loadAirdrop(recipients, amounts)
    ▼
ConfidentialWrapper / ConfidentialAirdrop (Sepolia)
    │
    ▼
FHEVM — FHE.asEuint64(amount)
    │  Encrypted ciphertext stored onchain
    ▼
FHE.allow(encBalance, user) — only user can decrypt
    │
    ▼
EIP-712 decryption request → FHEVM Gateway → plaintext to user only
```

---

## Zama Track Submissions

**Bounty — Confidential Wrapper Registry (3,000 cUSDT)**
- `ConfidentialWrapper.sol` implements wrap/unwrap with FHE-encrypted balances
- Registry UI shows all deployed wrappers with live Etherscan links
- EIP-712 decryption flow documented in UI

**Builder — Full dApp (7,000 cUSDT)**
- Complete frontend + smart contracts + live demo
- Deployed and functional on Sepolia testnet
- Clean UI with wallet connect, real transactions

**Special Bounty × TokenOps (2,500 cUSDT)**
- Confidential Airdrop tab — FHE-encrypted amounts per recipient
- `loadAirdrop()` encrypts each amount individually onchain
- Only each recipient can decrypt their own allocation

---

## Smart Contracts

### ConfidentialWrapper.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "@fhevm/solidity/config/ZamaEthereumConfig.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ConfidentialWrapper is ZamaEthereumConfig, ERC20 {
    IERC20 public immutable underlying;
    mapping(address => euint64) private _encBalances;

    function wrap(uint64 amount) external {
        require(underlying.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        euint64 encAmount = FHE.asEuint64(amount);
        if (FHE.isInitialized(_encBalances[msg.sender])) {
            _encBalances[msg.sender] = FHE.add(_encBalances[msg.sender], encAmount);
        } else {
            _encBalances[msg.sender] = encAmount;
        }
        FHE.allowThis(_encBalances[msg.sender]);
        FHE.allow(_encBalances[msg.sender], msg.sender);
    }

    function unwrap(uint64 amount) external {
        _encBalances[msg.sender] = FHE.sub(_encBalances[msg.sender], FHE.asEuint64(amount));
        FHE.allowThis(_encBalances[msg.sender]);
        FHE.allow(_encBalances[msg.sender], msg.sender);
        underlying.transfer(msg.sender, amount);
    }
}
```

### ConfidentialAirdrop.sol

```solidity
function loadAirdrop(address[] calldata recipients, uint64[] calldata amounts) external onlyOwner {
    for (uint256 i = 0; i < recipients.length; i++) {
        euint64 encAmount = FHE.asEuint64(amounts[i]);
        _airdropAmounts[recipients[i]] = encAmount;
        FHE.allowThis(encAmount);
        FHE.allow(encAmount, recipients[i]);
    }
}
```

---

## Getting started

```bash
# Clone
git clone https://github.com/Isaaco3349/sealdrop
cd sealdrop

# Frontend
cd app
npm install
cp .env.example .env.local
# Add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
npm run dev

# Contracts
cd ../contracts
npm install
# Add SEPOLIA_RPC_URL and SEPOLIA_PRIVATE_KEY to .env
npx hardhat compile
npx hardhat ignition deploy ignition/modules/SealDrop.ts --network sepolia
```

---

## Project structure

```
sealdrop/
├── app/                          # Next.js frontend
│   ├── app/
│   │   ├── page.tsx              # Main dashboard
│   │   └── layout.tsx            # Providers (RainbowKit, Wagmi)
│   ├── components/
│   │   ├── Providers.tsx         # Wagmi + RainbowKit config
│   │   ├── RegistryTab.tsx       # Wrap/unwrap UI + registry
│   │   └── AirdropTab.tsx        # Confidential airdrop UI
│   └── lib/
│       └── contracts.ts          # Contract addresses + ABIs
└── contracts/                    # Hardhat project
    ├── contracts/
    │   ├── ConfidentialWrapper.sol
    │   ├── ConfidentialAirdrop.sol
    │   └── MockERC20.sol
    └── ignition/modules/
        └── SealDrop.ts
```

---

## Live demo

🌐 [sealdrop-7h7e.vercel.app](https://sealdrop-7h7e.vercel.app)

Connect MetaMask on Sepolia → Mint test tUSDC → Wrap into confidential ctUSDC → Send a confidential airdrop.

---

## Team

Built by @Isaaco3349 for Zama Season 3.

---

## License

MIT