const ERC20WithAutoMinerReward = artifacts.require(
  "./ERC20WithAutoMinerReward.sol"
);

module.exports = function (deployer) {
  deployer.deploy(ERC20WithAutoMinerReward);
};
