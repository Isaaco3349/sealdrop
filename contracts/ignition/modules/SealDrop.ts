import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SealDropModule = buildModule("SealDropModule", (m) => {
  // Deploy a mock ERC20 for testing (represents any ERC20 like USDC)
  const mockToken = m.contract("MockERC20", ["Test USDC", "tUSDC"]);

  // Deploy the ConfidentialWrapper
  const wrapper = m.contract("ConfidentialWrapper", [
    mockToken,
    "Confidential tUSDC",
    "ctUSDC",
    "0x0000000000000000000000000000000000000000",
  ]);

  // Deploy the ConfidentialAirdrop
  const airdrop = m.contract("ConfidentialAirdrop", [wrapper]);

  return { mockToken, wrapper, airdrop };
});

export default SealDropModule;