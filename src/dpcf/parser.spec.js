import chai, { expect } from "chai";

import parseExpr from "./parser";
import { $z, $s, $num, $var, $fun, $app, $ifz, $fix } from "./ast";

describe("dpcf.parser.lispish", () => {
  it("parses an empty program", () => {
    expect(parseExpr("")).to.deep.eq([]);
  });

  describe("num()", () => {
    it("parses z", () => {
      expect(parseExpr("z")).to.deep.eq($z);
    });

    it("parses s(z)", () => {
      expect(parseExpr("(s z)")).to.deep.eq($s($z));
    });

    it("parses unary 2", () => {
      expect(parseExpr("(s (s z))")).to.deep.eq($s($s($z)));
    });

    it("parses 0", () => {
      expect(parseExpr("0")).to.deep.eq($num(0));
    });

    it("parses 1", () => {
      expect(parseExpr("1")).to.deep.eq($num(1));
    });

    it("parses 2", () => {
      expect(parseExpr("2")).to.deep.eq($num(2));
    });

    it("parses 3", () => {
      expect(parseExpr("3")).to.deep.eq($num(3));
    });

    it("parses 12 and 200", () => {
      expect(parseExpr("12")).to.eql($num(12));
      expect(parseExpr("200")).to.eql($num(200));
    });
  });

  it("parses a variable", () => {
    expect(parseExpr("x")).to.eql($var("x"));
  });

  it("does not parse `lambda` as a variable", () => {
    expect(() => parseExpr("lambda")).to.throw();
  });

  it("does not parse `s` as a variable", () => {
    expect(() => parseExpr("s")).to.throw();
  });

  it("parses a lambda", () => {
    expect(parseExpr("(lambda (x) x)")).to.eql($fun("x", $var("x")));
  });

  it("parses a function app", () => {
    expect(parseExpr("(f x)")).to.eql(
      $app(
        $var("f"),
        $var("x")));
  });

  it("parses ifz", () => {
    expect(parseExpr("(ifz n 0 x (b x))")).to.eql(
      $ifz(
        $num(0),
        "x",
        $app($var("b"), $var("x")),
        $var("n")
      )
    );
  });

  it ("parses fix", () => {
    expect(parseExpr("(fix f (lambda (n) (f n)))")).to.eql(
      $fix(
        "f",
        parseExpr("(lambda (n) (f n))")
      )
    );
  });
});
