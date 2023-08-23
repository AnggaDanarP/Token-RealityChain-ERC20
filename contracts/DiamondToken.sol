//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error InvalidAmount();

contract DiamondToken is ERC20, Ownable {

    event AirdropToken(address _to, uint256 _amount);

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol
    ) ERC20(_tokenName, _tokenSymbol) {
        // Total supply: 100 million
        _mint(msg.sender, 100000000);
    }

    // but the supply can be increase
    function mint(address to, uint256 amount) external onlyOwner {
        if (amount == 0) {
            revert InvalidAmount();
        }
        _mint(to, amount);
    }

    function airdropToken(address to, uint256 amount) external onlyOwner {
        if (amount == 0) {
            revert InvalidAmount();
        }
        address admin = _msgSender();
        _transfer(admin, to, amount);
        emit AirdropToken(to, amount);
    }

}