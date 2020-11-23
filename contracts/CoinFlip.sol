import "./Ownable.sol";
import "./provableAPI.sol";
pragma solidity ^0.5.12;

contract CoinFlip is Ownable, usingProvable{
    
    uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;
    uint public balance;
    
    


    event coinFlipped(uint result);
    event flipWon();
    event flipLost();
    
    modifier validateBet(){
        require(msg.value > 0 && msg.value <= balance);
        _;
    }

    function flipCoin() private returns(uint) {
        uint result = now % 2;
        emit coinFlipped(result);
        return result;
    }



    function settleBet(uint prediction) public payable validateBet {
        require(prediction == 0 || prediction == 1);
        uint outcome = flipCoin();
        if(outcome == prediction) {
            emit flipWon();
            balance -= msg.value;
            msg.sender.transfer(msg.value * 2);
        } else {
            emit flipLost();
            balance += msg.value;     
        }
    }

    function addFunds() public onlyOwner payable returns(uint) {
        require(msg.value > 0);
        balance += msg.value;
        return balance;
    }

    function withdrawAll() public onlyOwner returns(uint) {
       uint toTransfer = balance;
       balance = 0;
       msg.sender.transfer(toTransfer);
       return toTransfer;
   }



}