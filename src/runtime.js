import syst from "./syst";
import dpcf from "./dpcf";

export default (lang, prelude) => {
  switch (lang) {
    case "syst":
      return {
        eval: (program, trace, flags) => {
          const expr = syst.parse(prelude + "\n" + program);
          return syst.eval(expr, trace, flags);
        },
        static: expr => {
          try {
            return syst.getType(expr);
          }
          catch (e) {
            return "unknown type";
          }
        },
        pretty: syst.pretty
      };

    case "dpcf":
      return {
        eval: (exprSource, trace, flags) => {
          return dpcf.eval(prelude, exprSource, trace, flags);
        },
        static: dpcf.static,
        pretty: dpcf.pretty
      };

    default:
      throw new Error(`No runtime for "${lang}" language`);
  }
};
