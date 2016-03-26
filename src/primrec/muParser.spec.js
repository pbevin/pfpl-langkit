import chai, { expect } from "chai";

import muParser, { muExpr } from "./muParser";
import { $num, $succ, $var, $lam, $app, $rec, $define } from "./ast";

chai.config.truncateThreshold = 1000;

function iter(n, f, x) {
  let result = x;

  for (let i = 0; i < n; i++) {
    result = f(result);
  }

  return result;
}

describe("parsing", () => {
  describe("muExpr", () => {
    it("parses an empty program", () => {
      expect(muExpr("")).to.deep.eq([]);
    });

    describe("unary numbers", () => {
      it("parses Z", () => {
        expect(muExpr("Z")).to.deep.eq($num(0));
      });

      it("parses S(Z)", () => {
        expect(muExpr("S(Z)")).to.deep.eq($num(1));
      });

      it("parses unary 2", () => {
        expect(muExpr("S(S(Z))")).to.deep.eq($num(2));
      });

      it("parses unary 3", () => {
        expect(muExpr("S(S(S(Z)))")).to.deep.eq($num(3));
      });

      it("parses unary 12", () => {
        const n = iter(12, x => "S(" + x + ")", "Z");
        expect(muExpr(n)).to.eql($num(12));
      });

      it("parses unary 200", () => {
        const n = iter(200, x => "S(" + x + ")", "Z");
        expect(muExpr(n)).to.eql($num(200));
      });
    });

    describe("decimal numbers", () => {
      it("parses 0", () => {
        expect(muExpr("0")).to.deep.eq($num(0));
      });

      it("parses 1", () => {
        expect(muExpr("1")).to.deep.eq($num(1));
      });

      it("parses 2", () => {
        expect(muExpr("2")).to.deep.eq($num(2));
      });

      it("parses 3", () => {
        expect(muExpr("3")).to.deep.eq($num(3));
      });

      it("parses 12 and 200", () => {
        expect(muExpr("12")).to.eql($num(12));
        expect(muExpr("200")).to.eql($num(200));
      });
    });

    it("parses an untyped lambda expression", () => {
      expect(muExpr("\\n -> S(n)")).to.deep.eq(
        $lam("n", $succ($var("n")))
      );
    });

    it("parses a typed lambda expression", () => {
      expect(muExpr("\\n : Nat -> S(n)")).to.eql(
        $lam("n", $succ($var("n")), "Nat")
      );
    });

    it("parses function application", () => {
      expect(muExpr("f(x)")).to.deep.eq(
        $app($var("f"), $var("x"))
      );
    });

    it("parses double function application", () => {
      expect(muExpr("f(x)(y)")).to.deep.eq(
        $app($app($var("f"), $var("x")), $var("y"))
      );
    });

    it("parses triple function application", () => {
      expect(muExpr("f(x)(y)(z)")).to.deep.eq(
        $app($app($app($var("f"), $var("x")), $var("y")), $var("z"))
      );
    });

    it("parses a direct function application", () => {
      expect(muExpr("(\\x -> S(x))(Z)")).to.deep.eq(
        $app($lam("x", $succ($var("x"))), $num(0))
      );
    });
  });

  describe("parsing recursion expressions", () => {
    it("parses a simple recursion", () => {
      expect(muExpr("rec n { Z -> Z | S(k) with m -> k }")).to.deep.eq(
        $rec($num(0), "k", "m", $var("k"), $var("n"))
      );
    });

    it("parses a complicated recursion", () => {
      const expr = "rec (rec n { Z -> Z | S(k) with m -> k }) { Z -> Z | S(k) with m -> k }";

      expect(muExpr(expr)).to.deep.eq(
        $rec(
          $num(0), "k", "m", $var("k"),
          $rec($num(0), "k", "m", $var("k"), $var("n"))
        )
      );
    });
  });

  describe("muParser", () => {
    it("parses a bare expr", () => {
      expect(muParser("S(Z)")).to.eql([ $num(1) ]);
    });

    it("parses a definition", () => {
      expect(muParser("two = S(S(Z))")).to.eql([ $define("two", $num(2)) ]);
    });

    it("parses a definition and expression", () => {
      expect(muParser("two = S(S(Z)); S(two)")).to.eql(
        [ $define("two", $num(2)),
          $succ($var("two"))
        ]
      );
    });
  });
});
