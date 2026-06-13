export const CONTRACTS = {
  MockERC20: "0x4434005c017a214574417e3045e4CEb64f93A025",
  ConfidentialWrapper: "0x001699daB4F9c25CD857330248d0772C18050684",
  ConfidentialAirdrop: "0xcf1bc05C91d87A99f96dD38D3b38da3412F84294",
} as const;
  
  export const SEPOLIA_CHAIN_ID = 11155111;
  
  export const WRAPPER_ABI = [
    {
      name: "wrap",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [{ name: "amount", type: "uint64" }],
      outputs: [],
    },
    {
      name: "unwrap",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [{ name: "amount", type: "uint64" }],
      outputs: [],
    },
    {
      name: "underlying",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "address" }],
    },
  ] as const;
  
  export const ERC20_ABI = [
    {
      name: "approve",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      outputs: [{ name: "", type: "bool" }],
    },
    {
      name: "balanceOf",
      type: "function",
      stateMutability: "view",
      inputs: [{ name: "account", type: "address" }],
      outputs: [{ name: "", type: "uint256" }],
    },
    {
      name: "mint",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      outputs: [],
    },
  ] as const;
  
  export const AIRDROP_ABI = [
    {
      name: "loadAirdrop",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [
        { name: "recipients", type: "address[]" },
        { name: "amounts", type: "uint64[]" },
      ],
      outputs: [],
    },
    {
      name: "claim",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [],
      outputs: [],
    },
    {
      name: "claimed",
      type: "function",
      stateMutability: "view",
      inputs: [{ name: "", type: "address" }],
      outputs: [{ name: "", type: "bool" }],
    },
  ] as const;