var SoldierIface = function(soldier) {
	this.soldier = soldier;
};

SoldierIface.prototype = {
	get: function (evaluator, name) {
		if (name == "enemy") {
			return evaluator.player != this.soldier.player;
		}
		if (name == "type") {
			return undefined;
		}
		if (name == "x" || name == "y") {
			return this.soldier[name];
		}
		return this.soldier.stats[name];
	},

	set: function (evaluator, name, value) {
		console.log ("FORBIDDEN SET");
	}
};

var Battle = function (players, field, maxSteps) {
	this.players = players;
	this.field = field;
	this.ended = false;
	this.winner = null;
	this.history = [];
	
	this.steps = 0;
	this.maxSteps = maxSteps;
};

Battle.prototype = {
	act: function (soldier, action) {
		if (action.type == "move") {
			var place = this.field[soldier.y][soldier.x];
			var i = place.indexOf (soldier);
			place.splice (i, 1);

			place = this.field[action.dest.y][action.dest.x];
			place.push (soldier);
		} else {
			console.log ("Unknown action from ", soldier, ": ", action);
		}
		
		this.history.push (action);
	},
	
	step: function () {
		if (this.ended) {
			return;
		}

		this.steps++;

		var state = [];
		state.__acl = { immutable: true }
		for (var i in this.field) {
			var row = [];
			row.__acl = { immutable: true }
			state.push (row);
			for (var j in this.field[i]) {
				var col = [];
				col.__acl = { immutable: true }
				row.push (col);
				for (var k in this.field[i][j]) {
					var unit = this.field[i][j][k];
					if (unit.stats.hp > 0) {
						unit = unit.copy ();
						unit.__acl = { immutable: true, iface: new SoldierIface(unit) };
						unit.x = j;
						unit.y = i;
						col.push (unit);
					}
				}
			}
		}

		var playerHp = {};
		playerHp[this.players[0]] = 0;
		playerHp[this.players[1]] = 0;
		for (var i=0; i < state.length; i++) {
			for (var j=0; j < state[i].length; j++) {
				for (var k=0; k < state[i][j].length; k++) {
					var unit = state[i][j][k];
					if (unit.stats.hp > 0) {
						playerHp[unit.player] += unit.stats.hp;
						this.act (unit, unit.action (state));
					}
				}
			}
		}

		if (playerHp[this.players[0]] == 0 && playerHp[this.players[1]] == 0) {
			this.ended = true;
			this.winner = null;
		} else if (playerHp[this.players[0]] == 0) {
			this.ended = true;
			this.winner = this.players[1];
		} else if (playerHp[this.players[1]] == 0) {
			this.ended = true;
			this.winner = this.players[0];
		} else if (this.steps >= this.maxSteps) {
			this.ended = true;
			this.winner = null;
		}
	},

	simulate: function () {
		while (!this.ended) {
			this.step ();
		}
	}
};

module.exports = Battle;