var ast = require("./ast.js");

var Parser = function (lex) {
	this.lex = lex;
	this.tok = null;
	this.lasttok = null;
};

Parser.prototype = {
	next: function () {
		this.lasttok = this.tok;
		this.tok = this.lex.next ();
	},

	parse: function () {
		this.next ();
		var expr = this.parseExpr ();
		this.expect ("eof");
		return expr;
	},

	// utils
	
	accept: function (t, v) {
		if (this.isTok (t, v)) {
			this.next ();
			return true;
		} else {
			return false;
		}
	},

	expect: function (t, v) {
		if (!this.isTok (t, v)) {
			console.log ("ERROR: expected "+t+" "+v+", got "+this.tok.type+" "+this.tok.value);
		}
	},

	skip: function (t, v) {
		this.expect (t, v);
		this.next ();
	},
	
	isTok: function (t, v) {
		return this.tok.type == t && (v === undefined || this.tok.value == v);
	},

	parseId: function () {
		this.expect ("id");
		var id = this.tok.value;
		this.next ();
		return id;
	},

	// parser

	parseExpr: function () {
		return this.parseSeq ();
	},

	parseSeq: function () {
		var inner = this.parseNonSeq ();
		if (!inner) {
			return null;
		}
		var seq = new ast.SeqExpr (inner);
		if (this.accept ("pun", ";")) {
			seq.next = this.parseSeq ();
		}
		return seq;
	},

	parseNonSeq: function () {
		return this.parseAssign ();
	},
	
	parseAssign: function () {
		var left = this.parseNonAssign ();
		if (this.accept ("op", "=")) {
			var op = this.lasttok.value;
			var right = this.parseAssign ();
			return new ast.BinaryExpr (op, left, right);
		}
		return left;
	},

	parseNonAssign: function () {
		return this.parseFunc ();
	},

	parseFunc: function () {
		if (this.accept ("id", "fun")) {
			var args = [];
			while (this.accept ("id")) {
				args.push (this.lasttok.value);
			}
			this.skip ("pun", ":");
			var body = this.parseBlock ();
			
			return new ast.FunExpr (args, body);
		}
		
		return this.parseIf ();
	},
	
	parseIf: function () {
		if (this.accept ("id", "if")) {
			this.skip ("pun", "(");
			var cond = this.parseRelational ();
			this.skip ("pun", ")");
			var body = this.parseBlock ();

			var expr = new ast.IfExpr (cond, body);
			if (this.accept ("id", "else")) {
				expr.falseBody = this.parseBlock ();
			}
			return expr;
		}
		return this.parseRelational ();
	},

	parseBlock: function () {
		var expr;
		if (this.accept ("pun", "{")) {
			expr = this.parseSeq ();
			this.skip ("pun", "}");
		} else {
			expr = this.parseNonSeq ();
		}
		return expr;
	},
	
	parseRelational: function () {
		var left = this.parseAdd ();
		if (this.accept ("op", ">") || this.accept ("op", ">=") ||
			this.accept ("op", "<") || this.accept ("op", "<=") ||
			this.accept ("op", "==") || this.accept ("op", "!=")) {
			var op = this.lasttok.value;
			var right = this.parseRelational ();
			return new ast.BinaryExpr (op, left, right);
		}
		return left;
	},
	
	parseAdd: function () {
		var left = this.parseMul ();
		if (this.accept ("op", "+") || this.accept ("op", "-")) {
			var op = this.lasttok.value;
			var right = this.parseAdd ();
			return new ast.BinaryExpr (op, left, right);
		}
		return left;
	},

	parseMul: function () {
		var left = this.parsePow ();
		if (this.accept ("op", "*") || this.accept ("op", "/") ||
			this.accept ("op", "//")) {
			var op = this.lasttok.value;
			var right = this.parseMul ();
			return new ast.BinaryExpr (op, left, right);
		}
		return left;
	},

	parsePow: function () {
		var left = this.parseUnary ();
		if (this.accept ("op", "**")) {
			var op = this.lasttok.value;
			var right = this.parsePow ();
			return new ast.BinaryExpr (op, left, right);
		}
		return left;
	},

	parseUnary: function () {
		var expr;
		
		if (this.accept ("op", "!") || this.accept ("op", "-") ||
			this.accept ("op", "++") || this.accept ("op", "--")) {
			var op = this.lasttok.value;
			expr = this.parsePrimary ();
			expr = new ast.UnaryExpr (op, expr, false);
		} else {
			expr = this.parsePrimary ();
		}

		if (this.accept ("op", "++") || this.accept ("op", "--")) {
			var op = this.lasttok.value;
			expr = new ast.UnaryExpr (op, expr, true);
		}
		return expr;
	},

	parsePrimary: function () {
		var expr = null;
		if (this.isTok ("id")) {
			expr = this.parseMember ();
		} else if (this.isTok ("num")) {
			expr = this.parseNumLiteral ();
		} else if (this.accept ("(")) {
			var expr = this.parseExpr ();
			this.skip (")");
			expr = expr;
		} else if (this.isTok ("pun", "{")) {
			expr = this.parseObj ();
		} else if (this.isTok ("pun", "[")) {
			expr = this.parseList ();
		}

		while (true) {
			if (this.isTok ("pun", "(")) {
				expr = this.parseCall (expr);
			} else if (this.accept ("pun", ".")) {
				expr = this.parseMember (expr);
			} else if (this.isTok ("pun", "[")) {
				expr = this.parseElement (expr);
			} else {
				break;
			}
		}
		return expr;
	},

	parseMember: function (inner) {
		var id = this.parseId ();

		if (id == "null" && !inner) {
			return new ast.LitExpr (null);
		} else {
			return new ast.MemberExpr (id, inner, true);
		}
	},

	parseElement: function (inner) {
		this.skip ("pun", "[");
		var expr = this.parseNonAssign ();
		this.skip ("pun", "]");
		return new ast.MemberExpr (expr, inner, false);
	},
	
	parseCall: function (inner) {
		this.skip ("pun", "(");

		var expr = new ast.CallExpr (inner);
		while (!this.isTok ("eof") && !this.isTok ("pun", ")")) {
			var arg = this.parseNonSeq ();
			expr.args.push (arg);
			this.accept ("pun", ",");
		}
		
		this.skip ("pun", ")");
		return expr;
	},
	
	parseObj: function () {
		this.skip ("pun", "{");

		var obj = {};
		while (!this.isTok ("eof") && !this.isTok ("pun", "}")) {
			var id = this.parseId ();
			this.skip ("op", ":");
			var val = this.parseNonAssign ();
			obj[id] = val;
			
			this.accept ("pun", ",");
		}
		
		this.skip ("pun", "}");
		return new ast.ObjectExpr (obj);
	},

	parseList: function () {
		this.skip ("pun", "[");

		var expr = new ast.ListExpr ();
		while (!this.isTok ("eof") && !this.isTok ("pun", "]")) {
			expr.elems.push (this.parseNonSeq ());
			this.accept ("pun", ",");
		}
		
		this.skip ("pun", "]");
		return expr;
	},

	parseNumLiteral: function () {
		this.expect ("num");
		var expr = new ast.LitExpr (this.tok.value);
		this.next ();
		return expr;
	},
};

module.exports = Parser;