var Battle = require("./battle.js");
var army = require("./army.js");

var player1 = "Player 1";
var player2 = "Player 2";

var code1 = "{}";
var code2 = "{}";
var soldierType1 = new army.SoldierType ("Type 1");
var soldierType2 = new army.SoldierType ("Type 2");
var soldier1 = new army.Soldier (player1, soldierType1);
var soldier2 = new army.Soldier (player2, soldierType2);

var field = [
	[[soldier1.copy ()], [], [], []],
	[[], [], [], []],
	[[], [], [], []],
	[[], [], [], []],
	[[], [], [], [soldier1]]
];

var battle = new Battle ([player1, player2], field, 100);
battle.simulate ();
console.log (battle.winner);
