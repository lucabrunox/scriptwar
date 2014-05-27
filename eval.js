var ast = require("./ast.js");

var Eval = function () {
	this.scope = {};
	this.val = null;
};

Eval.prototype = {
	evaluate: function (expr) {
		expr.accept (this);
		return this.val;
	},

	visit_seq: function (expr) {
		expr.inner.accept (this);
		if (expr.next) {
			expr.next.accept (this);
		}
	},

	visit_fun: function (expr) {
		var self = this;
		this.val = function () {
			var nargs = Math.max (arguments.length, expr.params.length);
			for (var i=0; i < nargs; i++) {
				self.scope[expr.params[i]] = arguments[i];
			}
			expr.body.accept (self);
		};
	},

	visit_if: function (expr) {
		expr.cond.accept (this);
		if (this.val) {
			expr.trueBody.accept (this);
		} else if (expr.falseBody) {
			expr.falseBody.accept (this);
		}
	},

	visit_member: function (expr) {
		var elem = expr.name;
		if (!expr.literal) {
			elem.accept (this);
			elem = this.val;
		}
		
		var obj = this.scope;
		if (expr.inner) {
			expr.inner.accept (this);
			obj = this.val;
		}
		this.val = obj[elem];
	},

	visit_lit: function (expr) {
		this.val = expr.val;
	},

	visit_bin: function (expr) {
		if (expr.op == '=') {
			// assignment
			if (!(expr.left instanceof ast.MemberExpr)) {
				console.log ("ERROR not a member expr: "+expr.left.toString());
			} else {
				var obj;
				if (expr.left.inner) {
					obj = expr.left.inner.accept (this);
				} else {
					obj = this.scope;
				}
				expr.right.accept (this);
				obj[expr.left.name] = this.val;
			}
		} else {
			expr.left.accept (this);
			var left = this.val;
			expr.right.accept (this);
			var right = this.val;

			var op = expr.op;
			if (op == '+') {
				this.val = left+right;
			} else if (op == '-') {
				this.val = left-right;
			} else if (op == '>') {
				this.val = left>right;
			} else {
				console.log ("unsupported: "+expr.toString());
			}
		}
	},

	visit_unary: function (expr) {
		console.log ("unsupported: "+expr.toString());
	},

	visit_object: function (expr) {
		console.log ("unsupported: "+expr.toString());
	},

	visit_list: function (expr) {
		var list = [];
		for (var i in expr.elems) {
			expr.elems[i].accept (this);
			list.push (this.val);
		}
		this.val = list;
	},

	visit_call: function (expr) {
		expr.inner.accept (this);
		var fun = this.val;
		var args = [];
		
		for (var i in expr.args) {
			expr.args[i].accept (this);
			args.push (this.val);
		}

		fun.apply (this, args);
	},
};

module.exports = Eval;