export const $num = n => s("@num", Number(n));
export const $z = $num(0);
export const $var = x => s("@var", x);
export const $lam = (x, e) => s("@lam", x, e);
export const $app = (f, x) => s("@app", f, x);
export const $ifz = (d0, x, d1, e) => s("@ifz", d0, x, d1, e);
export const $fix = (x, d) => s("@fix", x, d);

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

function s(type, ...args) {
  return [ type, ...args ];
}
