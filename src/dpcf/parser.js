import _ from "lodash";
import { string, regex, optWhitespace, eof } from "parsimmon";
import { seqMap, lazy, alt } from "parsimmon";
import { $z, $num, $succ, $var, $lam, $app, $ifz, $fix } from "./ast";

const expr = lazy("expr", () => alt(
  succ.desc("(s [num])"),
  lam.desc("(lambda ([var]) [expr])"),
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
const ident = lexeme(regex(/(?!(fix|s|z|lambda|ifz)\b)[a-z]\w*\b/i));

const form = (...args) => parens(seqMap(...args));

const atom = alt(
  ident.map(x => $var(x)).desc("variable"),
  tok("z").map(() => $z).desc("z"),
  lexeme(regex(/[0-9]+/)).map($num).desc("decimal number")
);

const succ = form(
  tok("s"),
  expr,
  (_, e) => $succ(e)
);

const lam = form(
  tok("lambda"),
  parens(ident),
  expr,
  (_, x, e) => $lam(x, e)
);

const app = form(
  expr,
  expr,
  (fn, arg) => $app(fn, arg)
);

const ifz = form(
  tok("ifz"),
  expr,
  expr,
  ident,
  expr,
  (_, d, d0, x, d1) => $ifz(d0, x, d1, d)
);

const fix = form(
  tok("fix"),
  ident,
  expr,
  (_, x, d) => $fix(x, d)
);

function parse(parser, input) {
  const result = optWhitespace.then(parser).parse(input);
  if (result.status) {
    return result.value;
  } else {
    throw new Error(`Expected ${result.expected} at position ${result.index}`);
  }
}

export default input => parse(optExpr, input);
