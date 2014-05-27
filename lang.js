function isalpha(c) {
	return (((c >= 'a') && (c <= 'z')) || ((c >= 'A') && (c <= 'Z')));
}

function isdigit(c) {
	return ((c >= '0') && (c <= '9'));
}

function isalnum(c) {
	return (isalpha(c) || isdigit(c));
}

var Token = function (type, start, end, value) {
	this.type = type;
	this.start = start;
	this.end = end;
	this.value = value;
};

var Lexer = function (code) {
	this.code = code;
	this.len = code.length;
	this.ptr = 0;
	this.row = 1;
	this.col = 1;
	this.lastpos = null;
};

Lexer.prototype = {
	pos: function () {
		return [this.row, this.col];
	},

	char: function () {
		return this.code[this.ptr];
	},

	eof: function () {
		return this.ptr >= this.len;
	},

	copy: function () {
		var lex = new Lexer (code);
		for (pname in ["len", "ptr", "row", "col", "lastpos"]) {
			lex[pname] = this[pname];
		}
	},
	
	inc: function () {
		if (this.eof()) {
			return;
		}
		this.lastpos = this.pos ();
		if (this.char() == '\n') {
			this.row++;
			this.col = 1;
		} else {
			this.col++;
		}
		this.ptr++;
	},

	skipSpaces: function () {
		while (this.char().trim().length == 0) {
			this.inc ();
		}
	},
	
	next: function () {
		if (this.eof()) {
			return new Token("eof");
		}

		this.skipSpaces ();
		while (this.char() == '#') {
			while (this.char() != '\n') {
				this.inc ();
			}
			if (this.eof()) {
				return new Token("eof");
			}
			this.inc ();
			this.skipSpaces ();
		}
		
		var start = this.pos ();
		this.lastpos = start;
		newtok = function (t, v) {
			return new Token (t, start, this.lastpos, v);
		}.bind (this);

		if (isalpha(this.char())) {
			s = "";
			while (isalnum(this.char())) {
				s += this.char();
				this.inc ();
			}
			return newtok ("id", s);
		}

		if (isdigit(this.char())) {
			d = 0;
			while (isdigit(this.char())) {
				d *= 10;
				d += parseInt (this.char());
				this.inc();
			}
			return newtok ("num", d);
		}

		var nextEqual = '=!><';
		if (nextEqual.indexOf (this.char()) >= 0) {
			var c = this.char();
			this.inc ();
			if (this.char() == '=') {
				this.inc ();
				return newtok ("op", c+"=");
			}
			return newtok ("op", c);
		}

		var doubleChars = '+-*/';
		if (doubleChars.indexOf (this.char()) >= 0) {
			var c = this.char();
			this.inc ();
			if (this.char() == c) {
				this.inc ();
				return newtok ("op", c+c);
			}
			return newtok ("op", c);
		}

		var singleChars = '.,:;{}[]()';
		if (singleChars.indexOf (this.char()) >= 0) {
			var c = this.char();
			this.inc ();
			return newtok ("pun", c);
		}
		
		return newtok ("unknown", this.char());
	}
};

var SeqExpr = function (inner) {
	this.inner = inner;
	this.next = null;
};

SeqExpr.prototype = {
	toString: function () {
		var res = this.inner.toString();
		if (this.next) {
			return res+"; "+this.next.toString();
		} else {
			return res;
		}
	}
};

var FunExpr = function (params, body) {
	this.params = params;
	this.body = body;
};

FunExpr.prototype = {
	toString: function () {
		var res = "fun";
		if (this.params) {
			for (var i in this.params) {
				res += " "+this.params[i];
			}
		}
		res += ": {\n"+this.body.toString()+"\n}";
		return res;
	}
};

var IfExpr = function (cond, body) {
	this.cond = cond;
	this.trueBody = body;
	this.falseBody = null;
};

IfExpr.prototype = {
	toString: function () {
		var res = "if ("+this.cond.toString()+") {\n"+this.trueBody.toString()+"\n}";
		if (this.falseBody) {
			res += "else {\n"+this.falseBody.toString()+"\n}";
		}
		return res;
	}
};

var MemberExpr = function (name, inner) {
	this.name = name;
	this.inner = inner;
};

MemberExpr.prototype = {
	toString: function () {
		if (!this.inner) {
			return this.name;
		} else {
			return this.inner.toString()+"."+this.name;
		}
	}
};

var LitExpr = function (val) {
	this.val = val;
};

LitExpr.prototype = {
	toString: function () {
		return ""+this.val;
	}
};

var BinaryExpr = function (op, left, right) {
	this.op = op;
	this.left = left;
	this.right = right;
};

BinaryExpr.prototype = {
	toString: function () {
		return "("+this.left.toString()+" "+this.op+" "+this.right.toString()+")";
	}
};

var UnaryExpr = function (op, inner, postfix) {
	this.op = op;
	this.inner = inner;
	this.postfix = postfix;
};

UnaryExpr.prototype = {
	toString: function () {
		if (this.postfix) {
			return "("+this.inner.toString()+this.op+")";
		} else {
			return "("+this.op+this.inner.toString()+")";
		}
	}
};

var ObjectExpr = function (obj) {
	this.obj = obj;
};

ObjectExpr.prototype = {
	toString: function () {
		var s = "{ ";
		for (var propname in this.obj) {
			s += propname+': ';
			s += this.obj[propname].toString();
			s += ", ";
		}
		s += " }";
		return s;
	}
};

var ListExpr = function () {
	this.elems = [];
};

ListExpr.prototype = {
	toString: function () {
		var s = "[ ";
		for (var i in this.elems) {
			s += "("+this.elems[i].toString()+")";
			s += ", ";
		}
		s += " ]";
		return s;
	}
};

var CallExpr = function (inner) {
	this.inner = inner;
	this.args = [];
};

CallExpr.prototype = {
	toString: function () {
		var s = this.inner.toString()+" (";
		for (var i in this.args) {
			s += "("+this.args[i].toString()+")";
			s += ", ";
		}
		s += ")";
		return s;
	}
};

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
		var seq = new SeqExpr (inner);
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
			return new BinaryExpr (op, left, right);
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
			
			return new FunExpr (args, body);
		}
		
		return this.parseIf ();
	},
	
	parseIf: function () {
		if (this.accept ("id", "if")) {
			this.skip ("pun", "(");
			var cond = this.parseRelational ();
			this.skip ("pun", ")");
			var body = this.parseBlock ();

			var expr = new IfExpr (cond, body);
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
			return new BinaryExpr (op, left, right);
		}
		return left;
	},
	
	parseAdd: function () {
		var left = this.parseMul ();
		if (this.accept ("op", "+") || this.accept ("op", "-")) {
			var op = this.lasttok.value;
			var right = this.parseAdd ();
			return new BinaryExpr (op, left, right);
		}
		return left;
	},

	parseMul: function () {
		var left = this.parsePow ();
		if (this.accept ("op", "*") || this.accept ("op", "/") ||
			this.accept ("op", "//")) {
			var op = this.lasttok.value;
			var right = this.parseMul ();
			return new BinaryExpr (op, left, right);
		}
		return left;
	},

	parsePow: function () {
		var left = this.parseUnary ();
		if (this.accept ("op", "**")) {
			var op = this.lasttok.value;
			var right = this.parsePow ();
			return new BinaryExpr (op, left, right);
		}
		return left;
	},

	parseUnary: function () {
		var expr;
		
		if (this.accept ("op", "!") || this.accept ("op", "-") ||
			this.accept ("op", "++") || this.accept ("op", "--")) {
			var op = this.lasttok.value;
			expr = this.parsePrimary ();
			expr = new UnaryExpr (op, expr, false);
		} else {
			expr = this.parsePrimary ();
		}

		if (this.accept ("op", "++") || this.accept ("op", "--")) {
			var op = this.lasttok.value;
			expr = new UnaryExpr (op, expr, true);
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
			} else {
				break;
			}
		}
		return expr;
	},

	parseMember: function (inner) {
		var id = this.parseId ();

		if (id == "null" && !inner) {
			return new LitExpr (null);
		} else {
			return new MemberExpr (id, inner);
		}
	},

	parseCall: function (inner) {
		this.skip ("pun", "(");

		var expr = new CallExpr (inner);
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
		return new ObjectExpr (obj);
	},

	parseList: function () {
		this.skip ("pun", "[");

		var expr = new ListExpr ();
		while (!this.isTok ("eof") && !this.isTok ("pun", "]")) {
			expr.elems.push (this.parseNonSeq ());
			this.accept ("pun", ",");
		}
		
		this.skip ("pun", "]");
		return expr;
	},

	parseNumLiteral: function () {
		this.expect ("num");
		var expr = new LitExpr (this.tok.value);
		this.next ();
		return expr;
	},
};

// test
var code = "\
asd = 23 > 4;\
if (foo) {\
dsa = fun x: x < boh(foo).ok;\
foo = [1209 + asd];\
}\
";

var lex = new Lexer(code);
var parser = new Parser(lex);
var expr = parser.parse ();
console.log(expr.toString());