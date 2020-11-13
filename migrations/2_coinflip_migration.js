const CoinFlip = artifacts.require("CoinFlip");

module.exports = function(deployer) {
  deployer.deploy(CoinFlip).then(function(instance) {
    instance.addFunds({value: web3.utils.toWei("1", "ether")})
      .catch((err) => console.log("Error Adding Funds: ", err));
  }).catch((err) => console.log("Deploy Failed: " + err));
};