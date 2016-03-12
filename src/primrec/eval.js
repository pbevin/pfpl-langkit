import { iterate } from "./dynamics";

function noTrace() { }

export function evalExpr(expr, env = {}, trace = noTrace, opts = { }) {
  for (const result of iterate(expr, env, opts)) {
    switch (result.status) {
      case "value":
        return result.expr;
      case "stuck":
        throw new Error(result.error || "Stuck");
      case "step":
        trace(result.expr, result.rules);
    }
  }
}

export default function muEval(exprs, trace = noTrace, opts = { }) {
  if (exprs.length === 0) {
    throw new Error("Nothing to eval");
  }

  const env = {};

  for (const e of exprs) {
    if (!e) { throw new Error("Can't eval null"); }
    if (e[0] === "@define") {
      env[e[1]] = e[2];
    }
  }

  let expr = exprs[exprs.length - 1];

  return evalExpr(expr, env, trace, opts);
}
