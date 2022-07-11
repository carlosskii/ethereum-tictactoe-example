pragma solidity >0.4.0 <=0.9;

contract Migrations {
	address public owner;
	uint public last_completed_migration;

	constructor() {
		owner = msg.sender;
	}

	modifier ownerOnly() {
		assert(msg.sender == owner);
		_;
	}

	function setCompleted(uint completed) public ownerOnly {
		last_completed_migration = completed;
	}
}
