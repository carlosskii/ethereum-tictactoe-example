pragma solidity >0.4.0 <=0.8.15;

// Compile me!

contract TicTacToe {
	address public owner;
	struct Game {
		uint8[9] gameContents;
		uint8 winner;	
	}

	mapping(address=>bool) private currentGames;
	mapping(address=>Game) public gameObjects;

	constructor() {
		owner = msg.sender;
	}

	modifier ownerOnly() {
		assert(owner == msg.sender);
		_;
	}

	modifier notOwner() {
		assert(owner != msg.sender);
		_;
	}

	event OracleTurn(address client);
	event ClientTurn(uint8 winner);

	function requestGame() public notOwner {
		if (currentGames[msg.sender]) {
			delete currentGames[msg.sender];
			delete gameObjects[msg.sender];
		}

		currentGames[msg.sender] = true;
		uint8[9] memory arr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
		Game memory gameObj = Game(arr, 0);
		gameObjects[msg.sender] = gameObj;
	}

	function clientGetGameState() public notOwner returns(uint8[9] memory) {
		require(currentGames[msg.sender], "Game not found!");

		uint8[9] memory state = gameObjects[msg.sender].gameContents;
		return state;
	}

	function oracleGetGameState(address client) public ownerOnly returns(uint8[9] memory) {
		require(currentGames[client], "Game not found!");

		return gameObjects[client].gameContents;
	}

	function clientTickBox(uint8 box) public notOwner {
		require(currentGames[msg.sender], "Game not found!");
		require(gameObjects[msg.sender].gameContents[box] == 0, "Box is already marked!");

		gameObjects[msg.sender].gameContents[box] = 1;
		emit OracleTurn(msg.sender);
	}

	function oracleTickBox(address client, uint8 box) public ownerOnly {
		require(currentGames[client], "Game not found!");
		require(gameObjects[client].gameContents[box] == 0, "Box is already marked!");
		require(gameObjects[client].winner != 1, "Client has already won!");

		gameObjects[client].gameContents[box] = 2;
		emit ClientTurn(gameObjects[client].winner);
	}

	function oracleSetWinner(address client, uint8 _winner) public ownerOnly {
		require(currentGames[client], "Game not found!");
		require(gameObjects[client].winner == 0, "Winner is already set!");

		gameObjects[client].winner = _winner;
	}

	function oracleAnnounceWinner(address client, uint8 _winner) public ownerOnly {
		require(currentGames[client], "Game not found!");

		gameObjects[client].winner = _winner;
		emit ClientTurn(_winner);
	}
}
