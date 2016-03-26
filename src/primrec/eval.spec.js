import { expect } from "chai";
import muEval, { evalExpr } from "./eval";
import muParser, { muExpr } from "./muParser";

const ex = (input, env = {}) => evalExpr(muExpr(input), env);

describe("muEval", () => {
  it("evaluates 0", () => {
    expect(ex("0")).to.deep.eq(muExpr("0"));
  });

  it("evaluates 1", () => {
    expect(ex("1")).to.deep.eq(muExpr("1"));
  });

  it("evaluates a variable", () => {
    expect(ex("y", { y: muExpr("1") })).to.deep.eq(muExpr("1"));
  });

  describe("recursion", () => {
    it("evaluates a recursion at Z", () => {
      expect(ex("rec Z { Z -> S(Z) | S(x) with y -> x }")).
        to.deep.eq(muExpr("S(Z)"));
    });

    describe("at S", () => {
      it("sets x", () => {
        const expr = "rec 3 { Z -> r | S(x) with y -> x }";
        expect(ex(expr)).to.deep.eq(muExpr("2"));
      });

      it("sets y", () => {
        const expr = "rec 10 { Z -> 3 | S(x) with y -> y }";
        expect(ex(expr)).to.deep.eq(muExpr("3"));
      });
    });

    it("can double a number", () => {
      const expr = "rec 10 { Z -> 0 | S(x) with y -> S(S(y)) }";
      expect(ex(expr)).to.deep.eq(muExpr("20"));
    });
  });

  describe("function call", () => {
    it("substitutes the parameter", () => {
      expect(ex("(\\x -> S(x))(10)")).to.deep.eq(muExpr("11"));
    });
  });

  it("includes definitions", () => {
    const exprs = muParser("two = S(S(Z)); S(two)");
    expect(muEval(exprs)).to.deep.eq(muExpr("3"));
  });

//   it("returns a definition as the result of an assignment", () => {
//     expect(muEval(muParser("x = Z"))).to.deep.eq(muExpr("Z"));
//   });
});
