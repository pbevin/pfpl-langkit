import { expect } from "chai";
import { step, subst, isVal, $pred } from "./dynamics";
import parseExpr from "./parser";
import { $z, $s, $num, $ifz, $var, $fun, $app, $fix } from "./ast";

describe("step()", () => {
  specify("22.4a (step Z)", () => {
    expect(step($z)).to.eql({
      status: "value",
      rule: "z is a num [22.4a]",
      expr: $num(0)
    });
  });

  specify("22.4b (step inside s)", () => {
    expect(step($s($z))).to.eql({
      status: "step",
      rule: "z is a num [22.4a]",
      expr: $s(parseExpr("0"))
    });
  });

  specify("22.4c (step successor of an error)", () => {
    const errorExpr = $s($fun("x", $z));
    expect(step($s(errorExpr))).to.eql({
      status: "error",
      error: "Not a number"
    });
  });

  specify("22.4d (step successor of a number", () => {
    expect(step($s($num(3)))).to.eql({
      status: "step",
      rule: "Successor of number [22.4d]",
      expr: $num(4)
    });
  });

  specify("22.4e (step successor of a not-number", () => {
    const notNum = $fun("x", $z);
    expect(step($s(notNum))).to.eql({
      status: "error",
      error: "Not a number"
    });
  });

  specify("22.4f (step argument of ifz", () => {
    expect(step($ifz(null, null, null, $z))).to.eql({
      status: "step",
      rule: "Step argument of ifz [22.4f]",
      expr: $ifz(null, null, null, $num(0))
    });
  });

  specify("22.4g (step ifz when argument is error)", () => {
    const errorExpr = $s($fun("x", $z));
    expect(step($ifz(null, null, null, errorExpr))).to.eql({
      status: "error",
      error: "Not a number"
    });
  });

  specify("22.4h (evaluate ifz at 0)", () => {
    expect(step($ifz($num(42), null, null, $num(0)))).to.eql({
      status: "step",
      rule: "Eval ifz at 0 [22.4h]",
      expr: $num(42)
    });
  });

  specify("22.4i (evaluate ifz at n+1)", () => {
    expect(step($ifz(null, "x", $var("x"), $num(17)))).to.eql({
      status: "step",
      rule: "Eval ifz at n+1 (n = 16) [22.4i]",
      expr: $num(16)
    });
  });

  specify("22.4j (step ifz when argument is not-number)", () => {
    const notNum = $fun("x", $z);

    expect(step($ifz(null, null, null, notNum))).to.eql({
      status: "error",
      error: "Not a number"
    });
  });

  specify("22.4k (step fn in function application)", () => {
    const funReturningFun = $fun("x", $fun("y", $var("x")));
    const stepsToFun = $app(funReturningFun, $z);

    expect(step($app(stepsToFun, $z))).to.eql({
      status: "step",
      rule: "Step fn in function application [22.4k]",
      expr: $app($fun("y", $z), $z)
    });
  });

  specify("22.4l (step function application when fn is err)", () => {
    const errorExpr = $s($fun("x", $z));
    expect(step($app(errorExpr, $z))).to.eql({
      status: "error",
      error: "Not a number"
    });
  });

  specify("22.4m (apply a lambda)", () => {
    const f = $fun("z", $s($var("z")));
    const a = $num(66);
    expect(step($app(f, a))).to.eql({
      status: "step",
      rule: "Apply fun [22.4m]",
      expr: $s($num(66))
    });
  });

  specify("22.4n (step function application when fn is not-fun)", () => {
    expect(step($app($num(5), $z))).to.eql({
      status: "error",
      error: "Not a function"
    });
  });

  specify("22.4o (step fix)", () => {
    expect(step($fix("f", $app($var("f"), $z)))).to.eql({
      status: "step",
      rule: "Step fix expression [22.4o]",
      expr: $app($fix("f", $app($var("f"), $z)), $z)
    });
  });

  specify("num is self-evaluating", () => {
    expect(step($num(0))).to.eql({
      status: "value",
      expr: $num(0)
    });
  });

  specify("fun is self-evaluating", () => {
    expect(step($fun("x", $z))).to.eql({
      status: "value",
      expr: $fun("x", $z)
    });
  });

  specify("badly formed expression", () => {
    expect(() => step([ "hi" ])).to.throw();
  });
});

describe("subst", () => {
  specify("z", () => {
    expect(subst($z, "x", $num(0))).to.eql($z);
  });

  specify("var (same)", () => {
    expect(subst($var("x"), "x", $z)).to.eql($z);
  });

  specify("var (different)", () => {
    expect(subst($var("y"), "x", $z)).to.eql($var("y"));
  });

  specify("s", () => {
    expect(subst($s($var("x")), "x", $z)).to.eql($s($z));
  });

  specify("fun (same name)", () => {
    expect(subst($fun("x", $var("x")), "x", $z)).to.eql(
      $fun("x", $var("x"))
    );
  });

  specify("fun (different name)", () => {
    expect(subst($fun("y", $var("x")), "x", $z)).to.eql(
      $fun("y", $z)
    );
  });

  specify("ifz (argument)", () => {
    const expr = $ifz($z, "x", $z, $var("x"));

    expect(subst(expr, "x", $z)).to.eql(
      $ifz($z, "x", $z, $z)
    );
  });

  specify("ifz (z branch)", () => {
    const expr = $ifz($var("x"), "x", $z, $z);

    expect(subst(expr, "x", $z)).to.eql(
      $ifz($z, "x", $z, $z)
    );
  });

  specify("ifz (s branch, same name)", () => {
    const expr = $ifz($z, "x", $var("x"), $z);

    expect(subst(expr, "x", $z)).to.eql(
      $ifz($z, "x", $var("x"), $z)
    );
  });

  specify("ifz (s branch, different name)", () => {
    const expr = $ifz($z, "y", $var("x"), $z);

    expect(subst(expr, "x", $z)).to.eql(
      $ifz($z, "y", $z, $z)
    );
  });

  specify("fix (same name)", () => {
    const expr = $fix("x", $var("x"));

    expect(subst(expr, "x", $z)).to.eql(
      $fix("x", $var("x"))
    );
  });

  specify("fix (different name)", () => {
    const expr = $fix("y", $var("x"));

    expect(subst(expr, "x", $z)).to.eql(
      $fix("y", $z)
    );
  });

  specify("Malformed expression", () => {
    expect(() => subst([ "hi" ], "x", $z)).to.throw();
  });
});
