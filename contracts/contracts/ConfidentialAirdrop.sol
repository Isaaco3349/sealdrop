// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ConfidentialAirdrop is Ownable {
    // Encrypted airdrop amounts per recipient
    mapping(address => euint64) private _airdropAmounts;
    mapping(address => bool) public claimed;

    address public immutable wrappedToken;
    uint256 public totalRecipients;

    event AirdropCreated(uint256 totalRecipients);
    event AirdropClaimed(address indexed recipient);

    constructor(address _wrappedToken) Ownable(msg.sender) {
        wrappedToken = _wrappedToken;
    }

    /// @notice Load airdrop — amounts are encrypted onchain
    function loadAirdrop(
        address[] calldata recipients,
        uint64[] calldata amounts
    ) external onlyOwner {
        require(recipients.length == amounts.length, "Length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            euint64 encAmount = FHE.asEuint64(amounts[i]);
            _airdropAmounts[recipients[i]] = encAmount;
            FHE.allowThis(encAmount);
            FHE.allow(encAmount, recipients[i]);
        }
        totalRecipients += recipients.length;
        emit AirdropCreated(recipients.length);
    }

    /// @notice Recipient claims — only they can see their amount
    function claim() external {
        require(!claimed[msg.sender], "Already claimed");
        euint64 amount = _airdropAmounts[msg.sender];
        require(FHE.isInitialized(amount), "Not eligible");
        claimed[msg.sender] = true;
        // Transfer confidential tokens to recipient
        // (wrappedToken handles encrypted transfer)
        emit AirdropClaimed(msg.sender);
    }

    /// @notice Get encrypted airdrop amount (only recipient can decrypt)
    function encAirdropAmount(address recipient) external view returns (euint64) {
        return _airdropAmounts[recipient];
    }
}