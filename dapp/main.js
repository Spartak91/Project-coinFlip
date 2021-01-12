var web3 = new Web3(Web3.givenProvider);
var address;
var contractInstance;

var alert = `<div class="alert alert-dismissible fade show" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`

$(document).ready(function() {
    window.ethereum.enable().then(async function(accounts) {
        contractInstance = new web3.eth.Contract(abi, "0x60968EA2F262F3aCc7B0d41b9e2ef39b2C462a55", {from: accounts[0]});
        contractBalance = await web3.eth.getBalance("0x60968EA2F262F3aCc7B0d41b9e2ef39b2C462a55");
        

        console.log(contractInstance);
        console.log(contractBalance);

       
        
        
        contractInstance.events.allEvents()
            .on('data', function(event){
                if(event.event == "flipWon") {
                    let winningAlert = $.parseHTML(alert);
                    $(winningAlert).addClass("alert-success");
                    $(winningAlert).prepend("<strong>Flip Won!</strong> Your winnings have been transferred.");
                    $("#bet-alerts").prepend(winningAlert);
                    setTimeout(() => $(winningAlert).alert('close'), 5000);
                } else if (event.event == "flipLost") {
                    let losingAlert = $.parseHTML(alert);
                    $(losingAlert).addClass("alert-danger");
                    $(losingAlert).prepend("<strong>Flip Lost</strong> Thanks for playing!");
                    $("#bet-alerts").prepend(losingAlert);
                    setTimeout(() => $(losingAlert).alert('close'), 5000);
                } else if (event.event == "coinFlipped") {
                    let flippedAlert = $.parseHTML(alert);
                    $(flippedAlert).addClass("alert-primary");
                    if(event.returnValues.result == "0")
                    {
                        $(flippedAlert).prepend("<strong>Heads</strong>");
                    } else {
                        $(flippedAlert).prepend("<strong>Tails</strong>");
                    }
                    $("#bet-alerts").prepend(flippedAlert);
                    setTimeout(() => $(flippedAlert).alert('close'), 5000);
                }
            });
    });

    $("#place_bet_button").click(placeBet);

});

async function placeBet(){
    
    var bet = parseFloat($("#bet_input").val()) * (10 ** 18);
    var balance = await contractInstance.methods.balance().call();
    balance = parseFloat(balance);
    
    if(balance >= bet && bet > 0) {
        contractInstance.methods.settleBet().send({value: bet})
    } else {
        let warning = $.parseHTML(alert);
        $(warning).addClass("alert-danger");
        $(warning).prepend("Bet must be <strong>greater</strong> than 0 and <strong>less</strong> than " + balance/(10**18) + " ETH.");
        $("#bet-alerts").prepend(warning);
        setTimeout(() => $(warning).alert('close'), 5000);
    }

    
}
