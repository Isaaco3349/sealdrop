// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ConfidentialWrapper is ERC20 {
    IERC20 public immutable underlying;

    mapping(address => euint64) private _encBalances;

    address public immutable registry;

    event Wrapped(address indexed user, uint64 amount);
    event Unwrapped(address indexed user, uint64 amount);

    constructor(
        address _underlying,
        string memory _name,
        string memory _symbol,
        address _registry
    ) ERC20(_name, _symbol) {
        underlying = IERC20(_underlying);
        registry = _registry;
    }

    /// @notice Wrap ERC20 tokens into confidential version
    function wrap(uint64 amount) external {
        require(
            underlying.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        euint64 encAmount = FHE.asEuint64(amount);
        if (FHE.isInitialized(_encBalances[msg.sender])) {
            _encBalances[msg.sender] = FHE.add(_encBalances[msg.sender], encAmount);
        } else {
            _encBalances[msg.sender] = encAmount;
        }
        FHE.allowThis(_encBalances[msg.sender]);
        FHE.allow(_encBalances[msg.sender], msg.sender);
        emit Wrapped(msg.sender, amount);
    }

    /// @notice Unwrap confidential tokens back to ERC20
    function unwrap(uint64 amount) external {
        require(FHE.isInitialized(_encBalances[msg.sender]), "No balance");
        euint64 encAmount = FHE.asEuint64(amount);
        _encBalances[msg.sender] = FHE.sub(_encBalances[msg.sender], encAmount);
        FHE.allowThis(_encBalances[msg.sender]);
        FHE.allow(_encBalances[msg.sender], msg.sender);
        require(underlying.transfer(msg.sender, amount), "Transfer failed");
        emit Unwrapped(msg.sender, amount);
    }

    /// @notice Get encrypted balance (only accessible by the user themselves)
    function encBalanceOf(address user) external view returns (euint64) {
        return _encBalances[user];
    }
}