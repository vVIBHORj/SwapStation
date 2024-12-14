// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract SimpleDEX {
    uint256 public rate; // Exchange rate: 1 TokenA = `rate` TokenB

    event Swapped(address indexed user, address tokenA, address tokenB, uint256 amountA, uint256 amountB);

    constructor(uint256 _rate) {
        rate = _rate;
    }

    /**
     * @dev Swap an amount of `tokenA` for `tokenB`.
     * @param tokenA Address of the token being swapped.
     * @param tokenB Address of the token to receive.
     * @param amountA Amount of `tokenA` being swapped.
     */
    function swap(address tokenA, address tokenB, uint256 amountA) public {
        require(tokenA != address(0) && tokenB != address(0), "Invalid token addresses");
        require(amountA > 0, "Amount must be greater than zero");

        // Calculate the amount of tokenB to transfer
        uint256 amountB = amountA * rate;

        // Check tokenB balance in the contract
        require(IERC20(tokenB).balanceOf(address(this)) >= amountB, "Insufficient liquidity for tokenB");

        // Transfer tokenA from the user to the contract
        require(IERC20(tokenA).transferFrom(msg.sender, address(this), amountA), "TokenA transfer failed");

        // Transfer tokenB from the contract to the user
        require(IERC20(tokenB).transfer(msg.sender, amountB), "TokenB transfer failed");

        emit Swapped(msg.sender, tokenA, tokenB, amountA, amountB);
    }

    /**
     * @dev Add liquidity for a specific token pair.
     * @param token Address of the token to add liquidity for.
     * @param amount Amount of the token to add.
     */
    function addLiquidity(address token, uint256 amount) external {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than zero");

        // Transfer the token from the user to the contract
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Token transfer failed");
    }

    /**
     * @dev Update the exchange rate.
     * @param _rate New exchange rate.
     */
    function setRate(uint256 _rate) external {
        rate = _rate;
    }

    /**
     * @dev View function to check the balance of any token in the contract.
     * @param token Address of the token.
     * @return balance The balance of the token in the contract.
     */
    function checkTokenBalance(address token) external view returns (uint256 balance) {
        return IERC20(token).balanceOf(address(this));
    }
}
