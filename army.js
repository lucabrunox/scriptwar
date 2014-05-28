var Lexer = require("./lexer.js");
var Parser = require("./parser.js");
var Eval = require("./eval.js");

var SoldierType = function (name, code) {
	this.name = name;
	this.code = code;
	this._parsed = null;
};

SoldierType.prototype = {
	evaluate: function (scope) {
		if (!this._parsed) {
			var lex = new Lexer(this.code);
			var parser = new Parser(lex);
			this._parsed = parser.parse ();
		}

		var evaluator = new Eval();
		var val = evaluator.evaluate (scope, this._parsed);
		return val;
	}
};

var Stats = function () {
	this.attack = 0;
	this.attackEnergy = 0;
	
	this.accuracy = 0;
	this.accuracyRegen = 0;

	this.speed = 0;
	this.moveEnergy = 0;
	
	this.energy = 0;
	this.energyRegen = 0;
	
	this.hp = 0;
	this.hpRegen = 0;
	
	this.armor = 0;
	this.armorRegen = 0;
	
	this.shield = 0;
	this.shieldRegen = 0;
	
	this.range = 0;
	this.rangeRegen = 0;

};

var Soldier = function (player, type) {
	this.player = player;
	this.type = type;
	this.stats = new Stats;
};

Soldier.prototype = {
	action: function (state) {
		var scope = {
			field: state,
			soldier: this
		};

		var val = this.type.evaluate (scope);
		return val;
	},

	copy: function () {
		var c = new Soldier (this.player, this.type);
		for (var propname in this.stats) {
			c.stats[propname] = this.stats[propname];
		}
		return c;
	},
};

exports.SoldierType = SoldierType;
exports.Soldier = Soldier;