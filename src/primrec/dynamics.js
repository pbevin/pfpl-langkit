import { $num, $plus, $app, $lam, $rec } from "./ast";

function isNumber(expr) {
  return expr[0] === "@num";
}

function isZero(expr) {
  return expr[0] === "@num" && expr[1] === 0;
}

function isPlus(expr) {
  return expr[0] === "@plus";
}

function isSucc(expr) {
  return isPlus(expr) || (isNumber(expr) && !isZero(expr));
}

function isVariable(expr) {
  return expr[0] === "@var";
}

function isApplication(expr) {
  return expr[0] === "@app";
}

function isLambda(expr) {
  return expr[0] === "@lam";
}

function isRecursion(expr) {
  return expr[0] === "@rec";
}


export function isVal(expr, opts = {}) {
  if (isNumber(expr)) {
    return true;
  }

  if (isPlus(expr) && opts.lazy) {
    return true;
  }

  if (isPlus(expr) && isVal(expr[2])) {
    return true;
  }

  if (isLambda(expr)) {
    return true;
  }

  return false;
}

export function step(expr, env, opts = { }) {
  if (isVal(expr, opts)) {
    return { status: "value", expr: expr };
  }

  try {
    const result = sstep(expr, env, opts);
    return { status: "step", ...result };
  } catch (e) {
    if (e instanceof stuck) {
      let result = { status: "stuck", expr: expr };
      if (e.message) {
        result.error = e.message;
      }
      return result;
    }
    throw(e);
  }
}

// Assuming expr is steppable, return the next step
// and the rules it used to get there.
// If stuck, throw stuck()
function sstep(expr, env, opts) {
  if (isVariable(expr)) {
    return stepVariableExpansion(expr, env, opts);
  }

  if (!opts.lazy && isPlus(expr)) {
    return stepPlus(expr, env, opts);
  }

  if (isApplication(expr)) {
    return stepApp(expr, env, opts);
  }

  if (isRecursion(expr)) {
    return stepRec(expr, env, opts);
  }

  throw new stuck();
}

function stepVariableExpansion(expr, env) {
  const name = expr[1];
  const value = env[name];
  if (value) {
    return {
      rules: [ `expand variable ${name}` ],
      expr: value
    };
  } else {
    throw new stuck(`No such variable: ${name}`);
  }
}

function stepPlus(expr, env, opts) {
  const result = sstep(expr[2], env, opts);
  return {
    rules: [ "Expand inside S [9.3(a)]", ...result.rules ],
    expr: $plus(expr[1], result.expr)
  };
}

function stepApp(expr, env, opts) {
  const f = expr[1];
  const a = expr[2];

  if (!isVal(f)) {
    const result = sstep(f, env, opts);
    return {
      rules: [ "Expand function [9.3(b)]", ...result.rules ],
      expr: $app(result.expr, a)
    };
  }

  if (!opts.lazy && !isVal(a)) {
    const result = sstep(a, env, opts);
    return {
      rules: [ "Expand argument [9.3(c)]", ...result.rules ],
      expr: $app(f, result.expr)
    };
  }

  if (isLambda(f)) {
    const x = f[1];
    const exp = f[2];

    return {
      rules: [ "Apply λ [9.3(d)]" ],
      expr: subst(exp, x, a)
    };
  }

  throw new stuck();
}


function stepRec(expr, env, opts) {
  const [ _, e0, x, y, e1, e ] = expr;

  if (isZero(e)) {
    // Rule 9.3(f)
    return {
      rules: [ "Take Z branch [9.3(f)]" ],
      expr: e0
    };
  }

  if (isSucc(e)) {
    const pred = $pred(e);
    return {
      rules: [ "Take S branch [9.3(g)]" ],
      expr: subst(subst(e1, y, $rec(e0, x, y, e1, pred)), x, pred)
    };
  }

  const result = sstep(e, env, opts);
  return {
    rules: [ "Step recursion count [9.3(e)]", ...result.rules ],
    expr: $rec(e0, x, y, e1, result.expr)
  };
}

export function $pred(expr) {
  if (isPlus(expr)) {
    if (expr[1] == 1) {
      return expr[2];
    }

    return $plus(expr[1] - 1, expr[2]);
  }

  if (isNumber(expr)) {
    if (expr[1] === 0) {
      throw new Error("Attempt to find predecessor of 0");
    }
    return $num(expr[1] - 1);
  }

  throw new Error("Can't call $pred on " + expr[0]);
}

export function subst(exp, x, a) {
  if (isPlus(exp)) {
    return $plus(exp[1], subst(exp[2], x, a));
  }

  if (isVariable(exp) && exp[1] === x) {
    return a;
  }

  if (isVariable(exp)) {
    return exp;
  }

  if (isLambda(exp) && exp[1] !== x) {
    return $lam(exp[1], subst(exp[2], x, a));
  }

  if (isLambda(exp)) {
    return exp;
  }

  if (isApplication(exp)) {
    return $app(
      subst(exp[1], x, a),
      subst(exp[2], x, a)
    );
  }

  if (isRecursion(exp)) {
    const captured = x === exp[2] || x === exp[3];

    return $rec(
      subst(exp[1], x, a),
      exp[2],
      exp[3],
      captured ? exp[4] : subst(exp[4], x, a),
      subst(exp[5], x, a)
    );
  }

  return exp;
}

function stuck(message) {
  this.message = message;
}

function useTheForce(state, opts) {
  return opts.force && !isVal(state.expr, {lazy: false});
}

export function* iterate(expr, env, opts) {
  let state = step(expr, env, opts);
  for (;;) {
    if (state.status === "step") {
      yield state;
    } else if (state.status === "value" && useTheForce(state, opts)) {
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
