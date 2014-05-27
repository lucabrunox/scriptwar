var SeqExpr = function (inner) {
	this.inner = inner;
	this.next = null;
};

SeqExpr.prototype = {
	accept: function (vis) {
		vis.visit_seq (this);
	},
	
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
	accept: function (vis) {
		vis.visit_fun (this);
	},
	
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
	accept: function (vis) {
		vis.visit_if (this);
	},
	
	toString: function () {
		var res = "if ("+this.cond.toString()+") {\n"+this.trueBody.toString()+"\n}";
		if (this.falseBody) {
			res += "else {\n"+this.falseBody.toString()+"\n}";
		}
		return res;
	}
};

var MemberExpr = function (name, inner, literal) {
	this.name = name;
	this.inner = inner;
	this.literal = literal;
};

MemberExpr.prototype = {
	accept: function (vis) {
		vis.visit_member (this);
	},
	
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
	accept: function (vis) {
		vis.visit_lit (this);
	},
	
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
	accept: function (vis) {
		vis.visit_bin (this);
	},
	
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
	accept: function (vis) {
		vis.visit_unary (this);
	},
	
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
	accept: function (vis) {
		vis.visit_object (this);
	},
	
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
	accept: function (vis) {
		vis.visit_list (this);
	},
	
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
	accept: function (vis) {
		vis.visit_call (this);
	},
	
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