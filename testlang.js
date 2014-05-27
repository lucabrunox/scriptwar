var Lexer = require("./lexer.js");
var Parser = require("./parser.js");

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
