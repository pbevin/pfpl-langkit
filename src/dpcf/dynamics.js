import { $num, $s, $ifz, $fun, $app, $fix } from "./ast";


function isError(result) {
  return result.status === "error";
}

function isNum(expr) {
  return expr[0] === "@num";
}

function isntNum(expr) {
  return expr[0] === "@fun";
}

function isFun(expr) {
  return expr[0] === "@fun";
}

function isntFun(expr) {
  return expr[0] === "@num";
}

export function step(expr, opts = {}) {
  switch (expr[0]) {
    case "@z":
      return stepZero();

    case "@s":
      return stepSucc(expr, opts);

    case "@ifz":
      return stepIfz(expr, opts);

    case "@app":
      return stepApply(expr, opts);

    case "@fix":
      return stepFix(expr, opts);

    case "@fun":
    case "@num":
      return {
        status: "value",
        expr: expr
      };

    default:
      throw new Error(`Unknown expression of type ${expr[0]} in step()`);
  }
}

function stepZero() {
  return {
    status: "value",
    rule: "z is a num [22.4a]",
    expr: $num(0)
  };
}

function stepSucc([ _, expr ], opts) {
  if (isNum(expr)) {
    return {
      status: "step",
      rule: "Successor of number [22.4d]",
      expr: $num(1 + expr[1])
    };
  } else if (isntNum(expr)) {
    return {
      status: "error",
      error: "Not a number"
    };
  }

  const result = step(expr, opts);

  if (isError(result)) {
    return result;
  }

  return {
    status: "step",
    rule: result.rule,
    expr: $s(result.expr)
  };
}

function stepIfz([ _, d0, x, d1, e ], opts) {
  if (isNum(e)) {
    if (e[1] === 0) {
      return {
        status: "step",
        rule: "Eval ifz at 0 [22.4h]",
        expr: d0
      };
    } else {
      const n = e[1] - 1;
      return {
        status: "step",
        rule: `Eval ifz at n+1 (n = ${n}) [22.4i]`,
        expr: subst(d1, x, $num(n))
      };
    }
  }

  if (isntNum(e)) {
    return {
      status: "error",
      error: "Not a number"
    };
  }

  const result = step(e, opts);

  if (isError(result)) {
    return result;
  }

  return {
    status: "step",
    rule: "Step argument of ifz [22.4f]",
    expr: $ifz(d0, x, d1, result.expr)
  };
}

function stepApply([ _, fn, arg ], opts) {
  if (isFun(fn)) {
    const [ _, x, d ] = fn;
    return {
      status: "step",
      rule: "Apply fun [22.4m]",
      expr: subst(d, x, arg)
    };
  }

  if (isntFun(fn)) {
    return {
      status: "error",
      error: "Not a function"
    };
  }

  const result = step(fn, opts);

  if (isError(result)) {
    return result;
  }

  return {
    status: "step",
    rule: "Step fn in function application [22.4k]",
    expr: $app(result.expr, arg)
  };
}

function stepFix([ _, x, expr ]) {
  return {
    status: "step",
    rule: "Step fix expression [22.4o]",
    expr: subst(expr, x, $fix(x, expr))
  };
}

export function subst(expr, x, val) {
  switch (expr[0]) {
    case "@z":
    case "@num":
      return expr;

    case "@var":
      return expr[1] === x ? val : expr;

    case "@s":
      return $s(subst(expr[1], x, val));

    case "@fun":
      return expr[1] === x ? expr : $fun(expr[1], subst(expr[2], x, val));

    case "@app":
      return $app(subst(expr[1], x, val), subst(expr[2], x, val));

    case "@ifz":
      return substIfz(expr, x, val);

    case "@fix":
      return substFix(expr, x, val);

    default:
      throw new Error(`Unknown expression in subst: ${expr[0]}`);
  }
}

function substIfz([ _, d0, y, d1, e ], x, val) {
  return $ifz(
    subst(d0, x, val),
    y,
    x === y ? d1 : subst(d1, x, val),
    subst(e, x, val)
  );
}

function substFix(expr, x, val) {
  const [ _, y, e ] = expr;

  if (x === y) {
    return expr;
  } else {
    return $fix(y, subst(e, x, val));
  }
}
