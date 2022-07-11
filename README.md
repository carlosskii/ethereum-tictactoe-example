# ethereum-tictactoe-example
A tic-tac-toe game on an ethereum network.

This example runs off of ganache-cli. You will need to start up ganache-cli for this to work.

# Commands

Terminal 1:
```
npm install
truffle compile && truffle migrate --reset
node oracle.js
```

Terminal 2:
```
node client.js
```

This example was made with support from [this example](https://github.com/jamesmorgan/ethereum-dice-oracle-example).
