import { step } from "./dpcf/dynamics";
import parse, { parseDefinitions } from "./dpcf/parser";
import pretty from "./dpcf/pretty";

function* iterate(expr, env, opts) {
  let state = step(expr, env, opts);
  for (;;) {
    if (state.status === "step") {
      yield state;
    } else if (state.status === "value") {
      const extraState = step(state.expr, env, { lazy: false });
      extraState.rules = [ "force", ...extraState.rules ];
      yield extraState;
      state = extraState;
    } else {
      break;
    }

    state = step(state.expr, env, opts);
  }

  yield state;
}

function evalExpr(expr, env = {}, trace, opts = { }) {
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

function dpcfEval(prelude, exprSource, trace, opts = { }) {
  const env = {};

  const exprs = parseDefinitions(prelude);

  for (const e of exprs) {
    if (!e) { throw new Error("Can't eval null"); }
    if (e[0] === "@define") {
      env[e[1]] = e[2];
    }
  }

  let expr = parse(exprSource);

  return evalExpr(expr, env, trace, opts);
}

function dpcfStatic() {
  return "Unknown type";
}

export default {
  eval: dpcfEval,
  static: dpcfStatic,
  pretty
};
