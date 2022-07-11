const TTT = artifacts.require("./TicTacToe.sol");

module.exports = async function (deployer, network) {
	await deployer.deploy(TTT);
	console.log("TicTacToe deployed")
};
