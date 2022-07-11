process.on('unhandledRejection', error => console.log('unhandledRejection', error.message));

const prompt = require('prompt');

const TicTacToe = require('./build/contracts/TicTacToe.json');
const contract = require('truffle-contract');

const Web3 = require('web3');

let web3;
if (typeof web3 !== 'undefined') {
	web3 = new Web3(web3.currentProvider);
} else {
	// set the provider you want from Web3.providers
	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

// Truffle abstraction to interact with our deployed contract
const oracleContract = contract(TicTacToe);
oracleContract.setProvider(web3.currentProvider);

// see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
if (typeof oracleContract.currentProvider.sendAsync !== "function") {
	oracleContract.currentProvider.sendAsync = function () {
		return oracleContract.currentProvider.send.apply(
			oracleContract.currentProvider, arguments
		);
	};
}

console.log("--------------");
console.log("Oracle started and ready to play!");
console.log("--------------\n");

// Get accounts from web3
web3.eth.getAccounts((err, accounts) => {
	oracleContract.deployed()
		.then((oracleInstance) => {

			oracleInstance.OracleTurn()
				.watch(async function(err, event) {
					console.log("It's my turn!");

					let clientaddr = event.args.client.valueOf();
					var gameState = await oracleInstance.oracleGetGameState.call(clientaddr, {from: accounts[0], gasLimit: 6000000});

					// Check for win by client
					var clientWon = false;
					for (var i=0; i<3; i++) {
						if (gameState[i*3] == 1 && gameState[i*3+1] == 1 && gameState[i*3+2] == 1) {
							clientWon = true;
							break;
						}
						if (gameState[i] == 1 && gameState[i+3] == 1 && gameState[i+6] == 1) {
							clientWon = true;
							break;
						}
					}
					if (gameState[0] == 1 && gameState[4] == 1 && gameState[8] == 1) { clientWon = true; }
					if (gameState[2] == 1 && gameState[4] == 1 && gameState[6] == 1) { clientWon = true; }
					if (clientWon) {
						oracleInstance.oracleAnnounceWinner(clientaddr, 1, {from: accounts[0], gasLimit: 6000000}); return;
					}

					var boxchosen = 0;
					while (boxchosen < 9 && gameState[boxchosen] != 0) { boxchosen++ }
					if (boxchosen == 9) {
						oracleInstance.oracleAnnounceWinner(clientaddr, 3, {from: accounts[0], gasLimit: 6000000}); return;
					}
					gameState[boxchosen] = 2;
					var oracleWon = false;
					for (var i=0; i<3; i++) {
						if (gameState[i*3] == 2 && gameState[i*3+1] == 2 && gameState[i*3+2] == 2) {
							oracleWon = true; break;
						}
						if (gameState[i] == 2 && gameState[i+3] == 2 && gameState[i+6] == 2) {
							oracleWon = true; break;
						}
					}
					if (gameState[0] == 2 && gameState[4] == 2 && gameState[8] == 2) { oracleWon = true; }
					if (gameState[2] == 2 && gameState[4] == 2 && gameState[6] == 2) { oracleWon = true; }
					if (oracleWon) {
						await oracleInstance.oracleSetWinner(clientaddr, 2, {from: accounts[0], gasLimit: 6000000});
					}
					await oracleInstance.oracleTickBox(clientaddr, boxchosen, {from: accounts[0], gasLimit: 6000000});
					console.log("It's your turn!");
				});
		})
		.catch((err) => console.log(err));
}).catch((err) => console.log(err));
