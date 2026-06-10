export const CONTRACTS = {
    MockERC20: "0xD7FfFbD266B90580021108A6728431df5D6CF4AF",
    ConfidentialWrapper: "0x714819599d37151470aC190C59A11157f489DA77",
    ConfidentialAirdrop: "0xa7108F7Bd6bB6e0219C605164D389aD83EC2Df0f",
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