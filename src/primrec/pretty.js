export default
function pretty(expr, opts = {}, prec = 0) {
  if (!expr) {
    return "";
  }
  return prettyExpr(expr, opts, prec);
}

function parens(enclose, str) {
  if (enclose) {
    return "(" + str + ")";
  } else {
    return str;
  }
}

function prettyExpr(expr, opts, prec) {
  switch (expr[0]) {
    case "@num":
      return prettyNum(expr[1], opts);

    case "@plus":
      return prettyPlus(expr[1], expr[2], opts, prec);

    case "@lam":
      return prettyLambda(expr[1], expr[2], expr[3], opts, prec);

    case "@var":
      return expr[1];

    case "@app":
      return prettyApp(expr[1], expr[2], opts, prec);

    case "@rec":
      return prettyRec(expr[1], expr[2], expr[3], expr[4], expr[5], opts, prec);

    default:
      return JSON.stringify(expr);
  }
}

function prettyNum(n, opts) {
  if (opts.decimal) {
    return String(n);
  } else {
    return iter(n, k => "S(" + k + ")", "Z");
  }
}

function iter(n, f, x) {
  let result = x;
  for (let i = 0; i < n; i++) {
    result = f(result);
  }
  return result;
}

function prettyPlus(n, expr, opts, prec) {
  if (opts.decimal) {
    if (expr[0] === "@num") {
      return String(n + expr[1]);
    } else {
      return parens(prec > 6, `${n} + ${pretty(expr, opts, 0)}`);
    }
  } else {
    const inner = pretty(expr, opts, expr[1]);
    return replicate(n, "S(") + inner + replicate(n, ")");
  }
}

function prettyLambda(arg, expr, type, opts, prec) {
  if (type) {
    return parens(prec > 0, `λ${arg} : ${type} -> ${pretty(expr, opts, 0)}`);
  } else {
    return parens(prec > 0, `λ${arg} -> ${pretty(expr, opts, 0)}`);
  }
}

function prettyApp(fn, arg, opts, prec) {
  const f = pretty(fn, opts, 10);
  const x = pretty(arg, opts, 0);
  return parens(prec > 10, f + "(" + x + ")");
}

function prettyRec(e0, x, y, e1, e, opts, prec) {
  const p0 = pretty(e0, opts, 0);
  const p1 = pretty(e1, opts, 0);
  const p = parens(prec > 7, pretty(e, opts, 7));
  return parens(prec > 0, `rec ${p} { Z -> ${p0} | S(${x}) with ${y} -> ${p1} }`);
}

function replicate(n, str) {
  let result = "";
  for (let i = 0; i < n; i++) {
    result = result + str;
  }
  return result;
}
