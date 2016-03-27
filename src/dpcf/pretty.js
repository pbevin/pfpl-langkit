export default function pretty(expr) {
  switch (expr[0]) {

    case "@z":
      return "z";

    case "@s":
      return `(s ${pretty(expr[1])})`;

    case "@num":
      return String(expr[1]);

    case "@var":
      return expr[1];

    case "@fun":
      return prettyFun(expr);

    case "@app":
      return prettyApp(expr);

    case "@ifz":
      return prettyIfz(expr);

    case "@fix":
      return prettyFix(expr);

    default:
      throw new Error(`Unknown expression type ${expr[0]} in pretty()`);
  }
}

function prettyFun([ _, arg, e ]) {
  return `(fun (${arg}) ${pretty(e)})`;
}

function prettyApp([ _, fn, arg ]) {
  return `(${pretty(fn)} ${pretty(arg)})`
}

function prettyIfz([ _, d0, x, d1, e ]) {
  const pd0 = pretty(d0);
  const pd1 = pretty(d1);
  const pe  = pretty(e);

  return `(ifz ${pd0} ${x} ${pd1} ${pe})`;
}

function prettyFix([ _, x, e ]) {
  const pe = pretty(e);
  return `(fix ${x} ${pe})`;
}
