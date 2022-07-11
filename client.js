process.on('unhandledRejection', error => console.log('unhandledRejection', error.message));
const prompt = require('prompt');
const _ = require('lodash');

const OracleContract = require('./build/contracts/TicTacToe.json');
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
const oracleContract = contract(OracleContract);
oracleContract.setProvider(web3.currentProvider);

// see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
if (typeof oracleContract.currentProvider.sendAsync !== "function") {
	oracleContract.currentProvider.sendAsync = function () {
		return oracleContract.currentProvider.send.apply(
			oracleContract.currentProvider, arguments
		);
	};
}

function closeListener() {
	console.log("An event listener is being forcefully closed. An error will show up. This is completely normal.");
	throw "";
}

web3.eth.getAccounts((err, accounts) => {

	// Get deployed contract
	oracleContract.deployed().then((oracleInstance) => {

		prompt.start();
		console.log("...\n...\n...\n");

		console.log('Pick a square from 1 to 9 (top left to bottom right)');
		prompt.get(['square'], function (err, result) {
			oracleInstance.requestGame({from: accounts[1], gasLimit: 6000000});

			var pick = result.square;
			if (pick <= 0 || pick >= 10) {
				console.log(`${pick} is not a valid square!`);
				return;
			}

			console.log("\n\n");

			oracleInstance.clientTickBox(pick - 1, {from: accounts[1], gasLimit: 6000000}).then(() => {

				oracleInstance.ClientTurn().watch(async function(err, event) {
					let args = event.args;
					let winner = args.winner.valueOf();
					let gameState = await oracleInstance.clientGetGameState.call({from: accounts[1], gasLimit: 6000000});

					for (var i=0; i<9; i++) {
						if (i%3 == 0) { process.stdout.write("\n"); }
						if (gameState[i] == 0) { process.stdout.write('.'); }
						else if (gameState[i] == 1) { process.stdout.write('X'); }
						else { process.stdout.write('O'); }
					}
					console.log("\n");
					if (winner == 1) { console.log("You win!"); closeListener(); return; }
					if (winner == 2) { console.log("You lost..."); closeListener(); return; }
					if (winner == 3) { console.log("It's a draw!"); closeListener(); return; }

					var nextsquare = 0;

					let squarepickprompt = {
						name: 'square',
						message: 'Pick another square from 1 to 9 that is not filled',
						validator: /[1-9]/,
						warning: 'Must be 1-9'
					};
					prompt.get(squarepickprompt, function(err, result2) {
						nextsquare = result2.square;
						oracleInstance.clientTickBox(nextsquare - 1, {from: accounts[1], gasLimit: 6000000});
					});
				});
			});
		});
	}).catch((err) => console.log(err));
}).catch((err) => console.log(err));
