import "./Ownable.sol";
import "./provableAPI.sol";
pragma solidity ^0.5.12;

contract CoinFlip is Ownable, usingProvable{
    
    uint256 private constant NUM_RANDOM_BYTES_REQUESTED = 1;
    bytes32 queryId;
    uint256 public latestNumber;

    constructor() public {
        provable_setProof(proofType_Ledger);
    }
    
    struct Bet {
        address payable player;                         
        uint betValue;                                    
        bool result;      

    }

    uint public balance;

    mapping(address => uint) public balances;
    mapping (bytes32 => Bet) public betList; 
    mapping(address => bool) public waitingList;
    
    


    event StartBetEvent(address player, uint betValue, bytes32 Id);
    event EndBetEvent(address player, uint betValue, bytes32 Id, bool result);
    event LogNewProvableQuery(string description);
    event latestNumberEvent (uint256 latestNumber);
    
    modifier validateBet(){
        require(msg.value > 0 && msg.value <= balance);
        _;
    }

    


    function settleBet() public payable validateBet {
        
        require(balance!=0, "You lost");
        require(msg.value*2 <= balance, "Not enough funds to pay out");

        require(waitingList[msg.sender] == false);

        waitingList[msg.sender] = true;

        uint256 QUERY_EXECUTION_DELAY = 0;
        uint256 GAS_FOR_CALLBACK = 200000;

        queryId = provable_newRandomDSQuery(
            QUERY_EXECUTION_DELAY,
            NUM_RANDOM_BYTES_REQUESTED,
            GAS_FOR_CALLBACK
        );


        betList[queryId] = Bet(msg.sender,  msg.value, false);  

        emit StartBetEvent(msg.sender, msg.value, queryId);
        emit LogNewProvableQuery("Provable query was sent, standing by for answer...");
    }

    function __callback(bytes32 _queryId,string memory _result, bytes memory _proof) public {
        
        require(msg.sender == provable_cbAddress());
        
        if (provable_randomDS_proofVerify__returnCode(_queryId, _result, _proof) != 0) {
            
        } else {

            uint256 randomNumber = uint256(keccak256(abi.encodePacked(_result))) % 2;

            
            latestNumber = randomNumber;

            if(latestNumber == 0){
                betList[_queryId].result = false; // LOST
                balance += betList[_queryId].betValue;
            }

            else if(latestNumber == 1){
                betList[_queryId].result = true; // WIN
                balance -= betList[_queryId].betValue*2;
                balances[betList[_queryId].player] += betList[_queryId].betValue * 2;
            }

        }

        
        waitingList[betList[_queryId].player] = false;

        
        emit latestNumberEvent(latestNumber);
        emit EndBetEvent(betList[_queryId].player,betList[_queryId].betValue, _queryId, betList[_queryId].result);
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