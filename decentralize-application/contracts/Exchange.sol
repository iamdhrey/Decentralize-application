// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
    mapping( address => mapping(address => uint256)) public tokens;

    event Deposit(address indexed token, address indexed user, uint amount, uint balance);

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositToken(address _token, uint _amount) public {
        //Transfer token to exchange
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        //update the balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;
        //emit the event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    //Check Balances with a wrapper function
    function balanceOf(address _token, address _user) public view returns (uint256) {
        return tokens[_token][_user];
    }

    
}



//CHECKLIST
    //Deposit
    //Withdraw
    //Check Balance
    //Make order
    //Cancel order
    //Fill Orders
    //Charge Fees
    //Track Fee Account