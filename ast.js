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

exports.SeqExpr = SeqExpr;
exports.CallExpr = CallExpr;
exports.IfExpr = IfExpr;
exports.ListExpr = ListExpr;
exports.FunExpr = FunExpr;
exports.BinaryExpr = BinaryExpr;
exports.ObjectExpr = ObjectExpr;
exports.UnaryExpr = UnaryExpr;
exports.MemberExpr = MemberExpr;
exports.LitExpr = LitExpr;