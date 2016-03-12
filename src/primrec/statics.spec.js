import { expect } from "chai";
import getTypeAll, { getType, nat, type, arr, error } from "./statics";
import muParser, { muExpr } from "./muParser";

function prType(str, typeEnv = {}) {
  return getType(muExpr(str), typeEnv);
}

describe("statics", () => {
  describe("well typed", () => {
    specify("Z", () => {
      expect(prType("Z")).to.eql(nat);
    });

    specify("S(Z)", () => {
      expect(prType("S(Z)")).to.eql(nat);
    });

    specify("20", () => {
      expect(prType("20")).to.eql(nat);
    });

    specify("x", () => {
      expect(prType("x", { x: "T" })).to.eql("T");
    });

    specify("rec", () => {
      expect(prType("rec 3 { Z -> 0 | S(n) with m -> m }")).to.eql(nat);
    });

    specify("rec with variable e", () => {
      expect(prType("rec k { Z -> 0 | S(n) with m -> m }", { k: nat })).to.eql(nat);
    });

    specify("rec returning String", () => {
      expect(prType("rec 10 { Z -> str | S(n) with m -> m }", {
        str: type("String")
      })).to.eql(type("String"));
    });

    specify("lambda", () => {
      expect(prType("\\x : Nat -> S(x)")).to.eql(arr(nat, nat));
    });

    specify("lambda returning lambda", () => {
      expect(prType("\\x : Nat -> \\y : Nat -> x")).to.eql(arr(nat, arr(nat, nat)));
    });

    specify("function application", () => {
      expect(prType("(\\x : Nat -> S(x))(2)")).to.eql(nat);
    });

    specify("application to lambda returning lambda", () => {
      expect(prType("(\\x : Nat -> \\y : Nat -> x)(2)")).to.eql(arr(nat, nat));
      expect(prType("(\\x : Nat -> \\y : Nat -> x)(2)(3)")).to.eql(nat);
    });
  });

  describe("badly typed", () => {
    specify("s #1: succ of string", () => {
      expect(prType("S(k)", { k: type("String") })).
        to.eql(error("Can't take S(String)"));
    });

    specify("rec #1: can't iterate over String", () => {
      const t = prType("rec k { Z -> 0 | S(n) with m -> m }", { k: type("String") });
      expect(t).to.eql(error("Can't iterate over String"));
    });

    specify("rec #2: mismatched types in rec form", () => {
      const t = prType("rec 3 { Z -> k | S(n) with m -> Z }", { k: type("String") });
      expect(t).to.eql(
        error("Mismatched types in rec form: Z -> String but S -> Nat")
      );
    });

    specify("app #1: not a function", () => {
      expect(prType("Z(Z)")).to.eql(
        error("LHS of function application is not a function")
      );
    });

    specify("app #2: mismatched arg types", () => {
      const typeEnv = { f: arr(type("String"), nat) };
      expect(prType("f(Z)", typeEnv)).to.eql(
        error("Function wants String, but was given Nat")
      );
    });
  });
});

describe("getTypeAll", () => {
  it("returns the type of the final expression", () => {
    expect(getTypeAll(muParser("z = Z; S(z)"))).to.eq(nat);
  });

  it("...", () => {
    const prog = `
      plus = \\a : Nat -> \\b : Nat -> rec a {
        Z -> b | S(n) with m -> S(m)
      };
      times = \\a : Nat -> \\b : Nat -> rec a {
        Z -> 0 | S(n) with m -> plus(b)(m)
      };
      times(2)(3)`;
    expect(getTypeAll(muParser(prog))).to.eq(nat);
  });
});
