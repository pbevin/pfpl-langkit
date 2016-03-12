import _ from "lodash";
import Parsimmon from "parsimmon";
import { string, regex, optWhitespace, eof } from "parsimmon";
import { seq, seqMap, lazy, alt } from "parsimmon";
import { $z, $num, $succ, $var, $lam, $app, $rec, $define } from "./ast";

const expr = lazy("expr", () => alt(succ, lam, app, rec, atom, parens(expr)));
const lvar = lazy("expr", () => alt(succ, lam, atom, parens(expr)));
const optExpr = alt(expr, eof.result([]));

const lexeme = p => p.skip(optWhitespace);
const tok = str => lexeme(string(str));
const lp = tok("(");
const rp = tok(")");
const parens = p => lp.then(p).skip(rp);
const lb = tok("{");
const rb = tok("}");
const pipe = tok("|");
const ident = lexeme(regex(/[a-z]\w*/));
const type = lexeme(regex(/[A-Z]\w*/));
const lambda = tok("\\");
const colon = tok(":");
const arrow = tok("->");

const optionalType = Parsimmon.alt(
  colon.then(type),
  Parsimmon.succeed(null)
);

const variable = ident.map(x => $var(x)).desc("variable");
const zero = tok("Z").map(() => $z);
const num = lexeme(regex(/[0-9]+/)).map($num);
const atom = alt(variable, num, zero);

const succ = seqMap(
  tok("S"),
  lp,
  expr,
  rp,
  (_1, _2, e) => $succ(e)
).desc("successor");

const lam = seqMap(
  lambda,
  ident.desc("variable"),
  optionalType,
  arrow.desc("->"),
  expr.desc("expression"),
  (_1, x, t, _3, e) => t ? $lam(x, e, t) : $lam(x, e)
).desc("lambda");

const app = seqMap(
  lvar,
  lp.then(expr).skip(rp).atLeast(1),
  (f, xs) => makeApplication(f, xs)
).desc("function application");

const caseZ = zero.then(arrow).then(expr);
const caseS = seq(
  tok("S").then(lp).then(ident),
  rp.then(tok("with")).then(ident),
  arrow.then(expr)
);

const recCases = seqMap(
  lb.then(caseZ),
  pipe.then(caseS).skip(rb),
  (z, [ x, y, e ]) => ({ z, x, y, e })
);

const rec = seqMap(
  tok("rec"), expr,
  recCases,
  (_rec, e0, { z, x, y, e }) => $rec(z, x, y, e, e0)
);

const definition = seqMap(
  ident.skip(tok("=")),
  expr,
  $define
);

const programPiece = alt(definition, expr);

const program = sepBy(programPiece, tok(";")).skip(tok(";").many());

function sepBy(parser, separator) {
  return sepBy1(parser, separator).or(Parsimmon.of([]));
}

function sepBy1(parser, separator) {
  const pairs = separator.then(parser).many();

  return parser.chain(r => {
    return pairs.map(rs => [r].concat(rs));
  });
}

function makeApplication(f, argList) {
  const apps = argList.map(x => f => $app(f, x));
  return _.flow(apps)(f);
}


function mu(parser, input) {
  const result = optWhitespace.then(parser).parse(input);
  if (result.status) {
    return result.value;
  } else {
    throw new Error(`Expected ${result.expected} at position ${result.index}`);
  }
}

export const muExpr = input => mu(optExpr, input);
export default input => mu(program, input);
