var Battle = require("./battle.js");
var army = require("./army.js");

var player1 = "Player 1";
var player2 = "Player 2";

var code1 = "{type: 'move', dest: {x: 3, y: 3}}";
var code2 = code1;
var soldierType1 = new army.SoldierType ("Type 1", code1);
var soldierType2 = new army.SoldierType ("Type 2", code2);
var soldier1 = new army.Soldier (player1, soldierType1);
var soldier2 = new army.Soldier (player2, soldierType2);

soldier1.stats.hp = 10;
soldier2.stats.hp = 10;

var field = [
	[[soldier1.copy ()], [], [], []],
	[[], [], [], []],
	[[], [], [], []],
	[[], [], [], []],
	[[], [], [], [soldier2.copy ()]]
];

var battle = new Battle ([player1, player2], field, 100);
battle.simulate ();
console.log (battle.winner, battle.field);
