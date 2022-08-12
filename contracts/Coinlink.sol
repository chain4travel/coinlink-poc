// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Account.sol";

contract Coinlink {
    using Counters for Counters.Counter;
    event Received(address, uint);

    Counters.Counter private accountIds;
    Account[] public accounts;
    address public owner;
    mapping(uint256 => uint256) public vars;
    uint8 public constant VAR_INITIAL_AMOUNT = 0;
    uint8 public constant VAR_REVIEW_REWARD = 1;

    event Deploy(address addr);

    constructor(address _owner, uint _initialAmount) {
        owner = _owner;
        vars[VAR_INITIAL_AMOUNT] = _initialAmount;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function deploy() public {
        accountIds.increment();
        Account _contract = new Account{salt : bytes32(accountIds.current())}(msg.sender);
        payable(_contract).transfer(vars[VAR_INITIAL_AMOUNT]);
        accounts.push(_contract);
        emit Deploy(address(_contract));
    }

    function setVar(uint _key, uint _value) public {
        vars[_key] = _value;
    }

    // VIEWS

    function getAddress(bytes memory bytecode, uint _salt) public view returns (address) {
        bytes32 hash = keccak256(abi.encodePacked(bytes1(0xff), address(this), _salt, keccak256(bytecode)));
        return address(uint160(uint(hash)));
    }

    function getBytecode(address _owner) public pure returns (bytes memory) {
        bytes memory bytecode = type(Account).creationCode;
        return abi.encodePacked(bytecode, abi.encode(_owner));
    }

    function getDeployedContracts() public view returns (address[] memory addresses) {
        addresses = new address[](accounts.length);
        for (uint i = 0; i < accounts.length; i++) {
            addresses[i] = address(accounts[i]);
        }
        return addresses;
    }

    function getLastDeployed() public view returns (address) {
        return address(accounts[accounts.length - 1]);
    }

}
