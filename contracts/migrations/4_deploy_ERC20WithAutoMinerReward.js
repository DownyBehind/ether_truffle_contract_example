const { BigNumber } = require("@ethersproject/bignumber");

const ERC20WithAutoMinerReward = artifacts.require(
  "./ERC20WithAutoMinerReward.sol"
);

module.exports = function (deployer) {
  deployer.deploy(
    ERC20WithAutoMinerReward,
    BigNumber.from("1000000000000000000000000000")
  );
};
