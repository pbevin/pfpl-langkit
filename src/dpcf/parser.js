import _ from "lodash";
import { string, regex, optWhitespace, eof } from "parsimmon";
import { seq, seqMap, lazy, alt } from "parsimmon";
import { $z, $num, $s, $var, $fun, $app, $ifz, $fix, $define } from "./ast";

const expr = lazy("expr", () => alt(
  succ.desc("(s [num])"),
  fun.desc("(fun ([var]) [expr])"),
  app.desc("([fn] [arg])"),
  ifz.desc("(ifz [value] [zero case] [var] [nonzero case])"),
  fix.desc("(fix [var] [expr])"),
  atom
));
const optExpr = alt(expr, eof.result([]));

const lexeme = p => p.skip(optWhitespace);
const tok = str => lexeme(string(str));
const lp = tok("(");
const rp = tok(")");
const parens = p => lp.then(p).skip(rp);
const ident = lexeme(regex(/(?!(fix|s|z|fun|ifz|define)\b)[a-z]\w*\b/i));

const form = (...args) => parens(seqMap(...args));

const atom = alt(
  ident.map(x => $var(x)).desc("variable"),
  tok("z").map(() => $z).desc("z"),
  lexeme(regex(/[0-9]+/)).map($num).desc("decimal number")
);

const succ = form(
  tok("s"),
  expr,
  (_, e) => $s(e)
);

const fun = form(
  tok("fun"),
  parens(ident),
  expr,
  (_, x, e) => $fun(x, e)
);

const app = form(
  expr,
  expr,
  (fn, arg) => $app(fn, arg)
);

const ifz = form(
  tok("case"),
  expr,
  parens(
    tok("zero").then(expr)
  ),
  parens(
    seq(parens(tok("s").then(ident)), expr)
  ),
  (_, d, d0, [ x, d1 ]) => $ifz(d0, x, d1, d)
);

const fix = form(
  tok("fix"),
  ident,
  expr,
  (_, x, d) => $fix(x, d)
);

const define = form(
  tok("define"),
  ident,
  expr,
  (_, name, expr) => $define(name, expr)
);

function parse(parser, input) {
  const result = optWhitespace.then(parser).parse(input);
  if (result.status) {
    return result.value;
  } else {
    throw new Error(`Expected ${result.expected} at position ${result.index}`);
  }
}

export function parseDefinitions(input) {
  return parse(optWhitespace.then(define.many()), input);
}

export default input => parse(optExpr, input);
