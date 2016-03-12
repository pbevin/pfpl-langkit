class Type {
  constructor(name) {
    this.name = name;
  }

  toString() {
    return this.name;
  }

  sameType(other) {
    return this.name === other.name;
  }
}

class ArrowType {
  constructor(t1, t2) {
    this.lhs = t1;
    this.rhs = t2;
    this.arrowType = true;
  }

  toString() {
    return this.lhs + " -> " + this.rhs;
  }

  sameType(other) {
    return this.lhs.sameType(other.lhs) && this.rhs.sameType(other.rhs);
  }
}

class InvalidType {
  constructor(error) {
    this.error = error;
  }

  toString() {
    return this.error;
  }

  sameType() {
    return false;
  }
}

export function error(text) {
  return new InvalidType(text);
}

export function type(name) {
  return new Type(name);
}

export const nat = new Type("Nat");

export function arr(t1, t2) {
  return new ArrowType(t1, t2);
}

export function getType(e, typeEnv = {}) {
  try {
    return typeOf(e, typeEnv);
  } catch (err) {
    if (err instanceof InvalidType) {
      return err;
    } else {
      throw err;
    }
  }
}

function typeOf(e, typeEnv) {
  switch (e[0]) {
    case "@num":
      return nat;

    case "@plus":
      return typeOfPlus(e, typeEnv);

    case "@var":
      return typeOfVar(e, typeEnv);

    case "@rec":
      return typeOfRec(e, typeEnv);

    case "@lam":
      return typeOfLam(e, typeEnv);

    case "@app":
      return typeOfApp(e, typeEnv);

    default:
      return error("Unknown expression");
  }
}

function typeOfVar(v, typeEnv) {
  const [ _var, x ] = v;

  if (typeEnv[x]) {
    return typeEnv[x];
  } else {
    throw error("No such variable: " + x);
  }
}

function typeOfPlus(s, typeEnv) {
  const [ _s, _n, x ] = s;

  const xType = typeOf(x, typeEnv);

  if (xType.sameType(nat)) {
    return nat;
  } else {
    throw error(`Can't take S(${xType})`);
  }
}

function typeOfRec(rec, typeEnv) {
  const [ _rec, e0, x, y, e1, e ] = rec;

  const eType = typeOf(e, typeEnv);
  if (!eType.sameType(nat)) {
    throw error(`Can't iterate over ${eType}`);
  }

  const t = typeOf(e0, typeEnv);
  const s = typeOf(e1, { ...typeEnv, [x]: nat, [y]: t });

  if (!s.sameType(t)) {
    throw error(`Mismatched types in rec form: Z -> ${t} but S -> ${s}`);
  }

  return t;
}

function typeOfLam(lam, typeEnv) {
  const [ _lam, arg, e, t ] = lam;

  if (!t) {
    throw error("Untyped lambda expression");
  }

  const argType = type(t);
  const resultType = typeOf(e, { ...typeEnv, [arg]: argType });
  return arr(argType, resultType);
}

function typeOfApp(app, typeEnv) {
  const [ _app, fn, arg ] = app;

  const tf = typeOf(fn, typeEnv);
  const targ = typeOf(arg, typeEnv);

  if (!tf.arrowType) {
    throw error("LHS of function application is not a function");
  }
  if (!tf.lhs.sameType(targ)) {
    throw error(`Function wants ${tf.lhs}, but was given ${targ}`);
  }
  return tf.rhs;
}

export default function typeProg(exprs) {
  let typeEnv = {};
  let finalType = null;

  for (const expr of exprs) {
    if (expr[0] === "@define") {
      const [ _, name, val ] = expr;
      const t = typeOf(val, typeEnv);
      typeEnv[name] = t;
    } else {
      finalType = typeOf(expr, typeEnv);
    }
  }

  return finalType;
}
