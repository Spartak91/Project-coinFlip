const CoinFlip = artifacts.require("CoinFlip");
const truffleAssert = require("truffle-assertions");

contract("CoinFlip", async function(accounts) {
    let instance;

    before(async function() {
        instance = await CoinFlip.deployed();
    });

    it("should initialize with balance > 0", async function() {
        let balance = await instance.balance();
        assert(parseFloat(balance) > 0, "initialized without adding funds");
    });

    it("should have the same balance as the address", async function () {
        let balance = await instance.balance();
        let realBalance = await web3.eth.getBalance(instance.address);
        assert(parseFloat(balance) == realBalance, "balance variable does not equal address balance");
    });

    it("should not allow the user to bet more than the contract balance", async function() {
        await truffleAssert.fails(instance.settleBet(0, {value: web3.utils.toWei("2", "ether")}), truffleAssert.ErrorType.REVERT);
    });

    it("should allow the user to bet less than the contract balance", async function() {
        await truffleAssert.passes(instance.settleBet(0, {value: web3.utils.toWei(".1", "ether")}), truffleAssert.ErrorType.REVERT);
    });

    it("should increase the player's account balance if they win or decrease if they lose", async function () {
        let bet = await instance.settleBet(0, {value: web3.utils.toWei(".1", "ether")});
        let balanceBefore = await web3.eth.getBalance(accounts[0]);
        truffleAssert.eventEmitted(bet, "coinFlipped", async function(event){
            let balanceAfter = await web3.eth.getBalance(accounts[0]);
            if(event.result == 0) {
                return balanceBefore == balanceAfter + .1;
            } else {
                return balanceBefore == balanceAfter - .1;
            }
        });
    });

    it("should increase the contract's account balance if they lose or decrease if they win", async function () {
        let bet = await instance.settleBet(0, {value: web3.utils.toWei(".1", "ether")});
        let balanceBefore = await web3.eth.getBalance(instance.address);
        truffleAssert.eventEmitted(bet, "coinFlipped", async function(event){
            let balanceAfter = await web3.eth.getBalance(instance.address);
            if(event.result == 0) {
                return balanceBefore == balanceAfter - .1;
            } else {
                return balanceBefore == balanceAfter + .1;
            }
        });
    });

    it("should not let an account add funds if not owner", async function() {
        await truffleAssert.fails(instance.addFunds({from: accounts[1], value: web3.utils.toWei("1", "ether")}), truffleAssert.ErrorType.REVERT);
    });

    it("should let the owner add funds", async function() {
        await truffleAssert.passes(instance.addFunds({from: accounts[0], value: web3.utils.toWei("1", "ether")}));
    });

    it("should not let an account withdraw funds if not owner", async function() {
        await truffleAssert.fails(instance.withdrawAll({from: accounts[1]}), truffleAssert.ErrorType.REVERT);
    });

    it("should let the owner withdraw funds", async function() {
        let ownerBalanceBefore = await web3.eth.getBalance(accounts[0]);
        await truffleAssert.passes(instance.withdrawAll({from: accounts[0]}));
        let contractBalanceAfter = await web3.eth.getBalance(instance.address);
        let ownerBalanceAfter = await web3.eth.getBalance(accounts[0]);
        assert(contractBalanceAfter == web3.utils.toWei("0", "ether"), "balance not equal to zero after withdrawal");
        assert(ownerBalanceBefore < ownerBalanceAfter, "Owner did not receive funds");
    });

});