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

		if (this.char() == "'" || this.char() == "'") {
			var q = this.char();
			this.inc ();
			var s = q;
			while (!this.eof() && this.char() != q) {
				s += this.char();
				this.inc ();
			}
			s += this.char ();
			this.inc ();
			return newtok ("str", s);
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

module.exports = Lexer;