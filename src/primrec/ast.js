import s from "./sexp";

export const $num = n => s("@num", Number(n));
export const $z = $num(0);
export const $var = x => s("@var", x);
export const $lam = (x, e, t) => t ? s("@lam", x, e, t) : s("@lam", x, e);
export const $app = (f, x) => s("@app", f, x);
export const $rec = (e0, x, y, e1, e) => s("@rec", e0, x, y, e1, e);
export const $define = (name, expr) => s("@define", name, expr);

export function $plus(n, e) {
  if (e[0] === "@num") {
    return $num(n + e[1]);
  } else if (e[0] === "@plus") {
    return $plus(n + e[1], e[2]);
  } else {
    return s("@plus", Number(n), e);
  }
}

export function $succ(e) {
  return $plus(1, e);
}
