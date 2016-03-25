import { expect } from "chai";
import pretty from "./pretty";
import { muExpr as parse } from "./muParser";

describe("pretty", () => {

  it("returns Z for Z", () => {
    expect(pretty(parse("Z"))).to.eq("Z");
  });

  it("returns S(S(Z)) for S(S(Z))", () => {
    expect(pretty(parse("S(S(Z))"))).to.eq("S(S(Z))");
  });

  it("shows a unary $plus", () => {
    expect(pretty(parse("S(S(x))"))).to.eq("S(S(x))");
  });

  describe("with decimal option set", () => {
    it("returns 0 for Z", () => {
      expect(pretty(parse("Z"), { decimal: true })).to.eq("0");
    });

    it("returns 2 for S(S(Z))", () => {
      expect(pretty(parse("S(S(Z))"), { decimal: true })).to.eq("2");
    });

    it("returns 1 + x for S(x)", () => {
      expect(pretty(parse("S(x)"), { decimal: true })).to.eq("1 + x");
    });

    it("returns 2 + x for S(S(x))", () => {
      expect(pretty(parse("S(S(x))"), { decimal: true })).to.eq("2 + x");
    });
  });

  it("returns lambda for an expression", () => {
    expect(pretty(parse("\\x -> S(x)"))).to.eq("λx -> S(x)");
  });

  it("displays a function application", () => {
    expect(pretty(parse("f(x)"))).to.eq("f(x)");
  });

  it("displays a double function application", () => {
    expect(pretty(parse("f(x)(y)"))).to.eq("f(x)(y)");
  });

  it("displays a direct lambda application", () => {
    expect(pretty(parse("(\\x -> S(x))(3)"), { decimal: true })).
      to.eq("(λx -> 1 + x)(3)");
  });

  it("displays a rec expression", () => {
    const expr = "rec k { Z -> 1 | S(m) with n -> mult(m)(n) }";
    expect(pretty(parse(expr), { decimal: true })).to.eq(expr);
  });

  it("displays a rec expression with a number", () => {
    const expr = "rec 1 { Z -> 1 | S(m) with n -> mult(m)(n) }";
    expect(pretty(parse(expr), { decimal: true })).to.eq(expr);
  });

  it("displays a rec expression of a rec expression", () => {
    const expr = "rec (rec 3 { Z -> 1 | S(m) with n -> n }) { Z -> 1 | S(m) with n -> mult(m)(n) }";
    expect(pretty(parse(expr), { decimal: true })).to.eq(expr);
  });

  it("displays a rec of a plus", () => {
    const expr = "rec S(S(k)) { Z -> 1 | S(m) with n -> mult(m)(n) }";
    expect(pretty(parse(expr), { decimal: true })).to.eq(
      "rec (2 + k) { Z -> 1 | S(m) with n -> mult(m)(n) }"
    );

  });
});
