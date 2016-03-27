import { expect } from "chai";
import pretty from "./pretty";
import { $z, $s, $num, $var, $fun, $app, $ifz, $fix } from "./ast";

describe("pretty", () => {
  specify("z", () => {
    expect(pretty($z)).to.eq("z");
  });

  specify("s", () => {
    expect(pretty($s($z))).to.eq("(s z)");
  });

  specify("num", () => {
    expect(pretty($num(33))).to.eq("33");
  });

  specify("var", () => {
    expect(pretty($var("x"))).to.eq("x");
  });

  specify("fun", () => {
    expect(pretty($fun("x", $s($var("x"))))).to.eq("(fun (x) (s x))");
  });

  specify("app", () => {
    expect(pretty($app($var("f"), $var("x")))).to.eq("(f x)")
  });

  specify("ifz", () => {
    expect(pretty($ifz($z, "k", $s($var("k")), $var("n")))).to.eql(
      "(ifz z k (s k) n)"
    );
  });

  specify("fix", () => {
    expect(pretty($fix("f", $app($var("g"), $var("f"))))).to.eql(
      "(fix f (g f))"
    );
  });
});
