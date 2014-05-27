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
		for (var i in this.field) {
			var row = [];
			state.push (row);
			for (var j in this.field[i]) {
				var col = [];
				row[j] = col;
				for (var k in this.field[i][j]) {
					var unit = this.field[i][j][k];
					if (unit.stats.hp > 0) {
						unit = unit.copy ();
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
		for (var i in state) {
			for (var j in state[i]) {
				for (var k in state[i][j]) {
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