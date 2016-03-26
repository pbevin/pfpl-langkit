import { expect } from "chai";
import { step, subst, isVal, $pred } from "./dynamics";
import { muExpr } from "./muParser";
import pretty from "./pretty";

describe("isVal", () => {
  it("is true for zero", () => {
    expect(isVal(muExpr("0"))).to.eq(true);
  });

  it("is true for 5", () => {
    expect(isVal(muExpr("5"))).to.eq(true);
  });

  it("is false for a variable", () => {
    expect(isVal(muExpr("x"))).to.eq(false);
  });

  it("is false for the successor of a variable", () => {
    expect(isVal(muExpr("S(x)"))).to.eq(false);
  });

  it("is true for a lambda", () => {
    expect(isVal(muExpr("\\a -> a"))).to.eq(true);
  });

  describe("in lazy mode", () => {
    it("is true for the successor of a variable", () => {
      expect(isVal(muExpr("S(x)"), { lazy: true })).to.eq(true);
    });
  });
});

describe("step()", () => {
  it("returns status 'value' for a value", () => {
    expect(step(muExpr("0"))).to.eql({ status: "value", expr: muExpr("0") });
  });

  it("gets stuck on an undefined variable", () => {
    expect(step(muExpr("a"), { })).to.eql({
      status: "stuck",
      error: "No such variable: a",
      expr: muExpr("a")
    });
  });

  it("steps inside a plus", () => {
    expect(step(
      muExpr("S(x)"), { x: muExpr("2") }
    )).to.eql({
      status: "step",
      rules: [ "Expand inside S [9.3(a)]", "expand variable x" ],
      expr: muExpr("S(2)")
    });
  });

  it("steps f in f(a) if f is not a value", () => {
    expect(step(muExpr("f(a)"), { f: muExpr("\\a -> S(a)") })).to.eql({
      status: "step",
      rules: [ "Expand function [9.3(b)]", "expand variable f" ],
      expr: muExpr("(\\a -> S(a))(a)")
    });
  });

  it("steps a in f(a) if a is not a value", () => {
    expect(step(muExpr("(\\a -> S(a))(y)"), { y: muExpr("10") })).to.eql({
      status: "step",
      rules: [ "Expand argument [9.3(c)]", "expand variable y" ],
      expr: muExpr("(\\a -> S(a))(10)")
    });
  });

  it("substitutes the lambda if f and a are both values", () => {
    expect(step(muExpr("(\\a -> S(a))(1)"))).to.eql({
      status: "step",
      rules: [ "Apply λ [9.3(d)]" ],
      expr: muExpr("S(1)")
    });
  });

  it("bottoms out the base case of a recursion", () => {
    expect(step(muExpr("rec 0 { Z -> a | S(n) with m -> b }"))).to.eql({
      status: "step",
      rules: [ "Take Z branch [9.3(f)]" ],
      expr: muExpr("a")
    });
  });

  it("steps n in a recursion when the counter is numeric", () => {
    const result = step(
      muExpr("rec 2 { Z -> a | S(n) with m -> n }")
    );
    expect(result).to.eql({
      status: "step",
      rules: [ "Take S branch [9.3(g)]" ],
      expr: muExpr("1")
    });
  });

  it("steps m in a recursion when the counter is numeric", () => {
    const result = step(
      muExpr("rec 2 { Z -> a | S(n) with m -> S(m) }")
    );
    expect(result.status).to.eq("step");
    expect(pretty(result.expr, { decimal: true })).to.eq(
      "1 + rec 1 { Z -> a | S(n) with m -> 1 + m }"
    );
  });

  it("steps the counter in a recursion when it is not a value", () => {
    const result = step(
      muExpr("rec k { Z -> a | S(n) with m -> S(m) }"),
      { k: muExpr("3") }
    );
    expect(result).to.eql({
      status: "step",
      rules: [ "Step recursion count [9.3(e)]", "expand variable k" ],
      expr: muExpr("rec 3 { Z -> a | S(n) with m -> S(m) }")
    });
  });

  describe("in lazy mode", () => {
    it("does not step inside a plus", () => {
      expect(step(
        muExpr("S(x)"), { }, { lazy: true }
      )).to.eql({
        status: "value",
        expr: muExpr("S(x)")
      });
    });

    it("does not step the argument of a function application", () => {
      expect(step(muExpr("(\\a -> S(a))(y)"), { }, { lazy: true })).to.eql({
        status: "step",
        rules: [ "Apply λ [9.3(d)]" ],
        expr: muExpr("S(y)")
      });
    });


  });
});

describe("subst(exp, x, a)", () => {
  it("leaves a numeric value alone", () => {
    expect(subst(muExpr("0"), "x", muExpr("a"))).to.eql(muExpr("0"));
    expect(subst(muExpr("12"), "x", muExpr("a"))).to.eql(muExpr("12"));
  });

  it("substitutes inside plus", () => {
    expect(subst(muExpr("S(x)"), "x", muExpr("a"))).to.eql(muExpr("S(a)"));
  });

  it("substitutes a variable that matches", () => {
    expect(subst(muExpr("x"), "x", muExpr("a"))).to.eql(muExpr("a"));
  });

  it("leaves a non-matching variable", () => {
    expect(subst(muExpr("y"), "x", muExpr("a"))).to.eql(muExpr("y"));
  });

  it("substitutes inside a lambda body if its variable is different", () => {
    expect(subst(muExpr("\\y -> x"), "x", muExpr("a"))).to.eql(muExpr("\\y -> a"));
  });

  it("leaves a lambda body if its variable is the same", () => {
    expect(subst(muExpr("\\x -> x"), "x", muExpr("a"))).to.eql(muExpr("\\x -> x"));
  });

  it("substitutes in the f of an application", () => {
    expect(subst(muExpr("f(x)"), "f", muExpr("g"))).to.eql(muExpr("g(x)"));
  });

  it("substitutes in the x of an application", () => {
    expect(subst(muExpr("f(x)"), "x", muExpr("y"))).to.eql(muExpr("f(y)"));
  });

  it("substitutes in the Z branch of a rec", () => {
    expect(subst(
      muExpr("rec c { Z -> x | S(n) with m -> y }"), "x", muExpr("a")
    )).to.eql(
      muExpr("rec c { Z -> a | S(n) with m -> y }")
    );
  });

  it("substitutes in the S branch of a rec", () => {
    expect(subst(
      muExpr("rec c { Z -> x | S(n) with m -> S(y) }"), "y", muExpr("a")
    )).to.eql(
      muExpr("rec c { Z -> x | S(n) with m -> S(a) }")
    );
  });

  it("leaves the S branch of a rec if the n variable clashes", () => {
    expect(subst(
      muExpr("rec c { Z -> x | S(n) with m -> S(n) }"), "n", muExpr("a")
    )).to.eql(
      muExpr("rec c { Z -> x | S(n) with m -> S(n) }")
    );
  });

  it("leaves the S branch of a rec if the m variable clashes", () => {
    expect(subst(
      muExpr("rec c { Z -> x | S(n) with m -> S(m) }"), "m", muExpr("a")
    )).to.eql(
      muExpr("rec c { Z -> x | S(n) with m -> S(m) }")
    );
  });

  it("substitutes in the count of a rec", () => {
    expect(subst(
      muExpr("rec c { Z -> x | S(n) with m -> y }"), "c", muExpr("a")
    )).to.eql(
      muExpr("rec a { Z -> x | S(n) with m -> y }")
    );
  });
});

describe("$pred", () => {
  it("handles simple numeric cases", () => {
    expect($pred(muExpr("1"))).to.eql(muExpr("0"));
    expect($pred(muExpr("2"))).to.eql(muExpr("1"));
    expect($pred(muExpr("4"))).to.eql(muExpr("3"));
    expect($pred(muExpr("44"))).to.eql(muExpr("43"));
  });

  it("handles S(expr) cases", () => {
    expect($pred(muExpr("S(k)"))).to.eql(muExpr("k"));
    expect($pred(muExpr("S(S(k))"))).to.eql(muExpr("S(k)"));
  });

  it("refuses to calculate 0 - 1", () => {
    expect(() => $pred(muExpr("0"))).to.throw("Attempt to find predecessor of 0");
  });
});
