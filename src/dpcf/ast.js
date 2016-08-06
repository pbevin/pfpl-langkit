export const $num = n => s("@num", Number(n));
export const $z = s("@z");
export const $s = n => s("@s", n);
export const $var = x => s("@var", x);
export const $fun = (x, e) => s("@fun", x, e);
export const $app = (f, x) => s("@app", f, x);
export const $ifz = (d0, x, d1, e) => s("@ifz", d0, x, d1, e);
export const $fix = (x, d) => s("@fix", x, d);
export const $define = (x, d) => s("@define", x, d);

function s(type, ...args) {
  return [ type, ...args ];
}
