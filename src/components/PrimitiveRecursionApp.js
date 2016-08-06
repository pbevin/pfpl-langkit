import React, { PropTypes } from "react";

import Options from "./Options";
import CodeEditor from "./CodeEditor";
import Repl from "./Repl";

import makeRuntime from "../runtime";

// import muParser from "../primrec/muParser";
// import muEval from "../primrec/eval";
// import pretty from "../primrec/pretty";
// import getType from "../primrec/statics";

const PrimitiveRecursionApp = ({ program, actions }) => {
  const { toggleFlag, textChanged, revertPrelude } = actions;
  const replaceTextWithPrelude = () => revertPrelude();
  let repl = null;

  return (
    <div>
      <h1>PFPL Language Kit</h1>
      <Options program={program} actions={actions} />

      <div className="editor">
        <h2>Standard Prelude</h2>
        <CodeEditor
          lang={program.lang}
          value={program.text}
          onChange={textChanged}
        />
        <button onClick={replaceTextWithPrelude}>Revert Prelude</button>
      </div>
      <div className="repl">
        <h2>REPL</h2>
        <Repl
          ref={e => repl = e}
          welcome="*** PrimRec REPL"
          onLineEntered={(input, repl) => replEval(program, toggleFlag, input, repl.Write.bind(repl))}
        />
      </div>
    </div>
  );
};

PrimitiveRecursionApp.propTypes = {
  actions: PropTypes.object.isRequired,
  program: PropTypes.object.isRequired
};

function replEval(program, toggleFlag, input, output) {
  const { lang, text: prelude, decimal, trace: tracing, lazy, force } = program;
  input = input.trim();

  if (input === "") { return; }
  if (input === "trace") { return toggleFlag("trace"); }
  if (input === "decimal") { return toggleFlag("decimal"); }
  if (input === "lazy") { return toggleFlag("lazy"); }
  if (input === "force" || input === "jedi") {
    if (!force) {
      output("Great, kid. Don't get cocky.\n", "jqconsole-output");
    }
    return toggleFlag("force");
  }

  const runtime = makeRuntime(lang, prelude);

  let trace = () => null;
  let reductions = 0;
  if (tracing) {
    trace = (expr, rules) => {
      output(`=> {${rules.join(", ")}}`, "repl-trace");
      output(runtime.pretty(expr, { decimal }), "repl-trace");
      reductions++;
    };
  }

  const exprType = runtime.static(program);

  try {
    const finalExpr = runtime.eval(input, trace, { lazy, force });
    const prettyResult = runtime.pretty(finalExpr, { decimal });
    if (tracing) {
      output("** " + reductions + " reductions.", "repl-trace");
    }
    output(prettyResult, "jqconsole-output");
    if (exprType) {
      output(` :: ${exprType}\n`, "repl-typeof");
    } else {
      output("\n");
    }
  } catch (e) {
    throw(e);
  }
}

export default PrimitiveRecursionApp;
