var Lexer = require("./lexer.js");
var Parser = require("./parser.js");
var Eval = require("./eval.js");

// test
var code = "\
asd = 23 + 4;\
dsa = asd-10;\
f = fun x: x[1];\
f([1, -2+10**2])\
";

var lex = new Lexer(code);
var parser = new Parser(lex);
var expr = parser.parse ();
console.log(expr.toString());

var evaluator = new Eval();
var val = evaluator.evaluate (expr);
console.log(val);
