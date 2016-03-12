import React, { PropTypes } from "react";

import OptionToggle from "./OptionToggle";
import CodeEditor from "./CodeEditor";
import Repl from "./Repl";

import muParser from "../primrec/muParser";
import muEval from "../primrec/eval";
import pretty from "../primrec/pretty";
import getType from "../primrec/statics";

const PrimitiveRecursionApp = ({ program, actions }) => {
  const { toggleFlag, textChanged, revertPrelude } = actions;
  const replaceTextWithPrelude = () => revertPrelude();
  const { trace, decimal, lazy, force } = program;
  let repl = null;

  const setFlag = (flag, value) => {
    actions.setFlag(flag, value);
    repl.focus();
  };

  return (
    <div>
      <h1>Primitive Recursion</h1>
      <div className="editor">
        <h2>Standard Prelude</h2>
        <CodeEditor
          value={program.text}
          onChange={textChanged}
        />
        <button onClick={replaceTextWithPrelude}>Revert Prelude</button>
      </div>
      <div className="repl">
        <div className="repl-options">
          <OptionToggle checked={trace} name="trace" setFlag={setFlag}>
            Trace Execution
          </OptionToggle>
          <OptionToggle checked={decimal} name="decimal" setFlag={setFlag}>
            Show Decimal Values
          </OptionToggle>
        </div>
        <div className="repl-options">
          <OptionToggle checked={lazy} name="lazy" setFlag={setFlag}>
            Lazy Evaluation
          </OptionToggle>
          <OptionToggle checked={force} name="force" setFlag={setFlag}>
            Use The Force
          </OptionToggle>
        </div>
        <h2>REPL</h2>
        <Repl
          ref={e => repl = e}
          welcome="*** PrimRec REPL"
          onLineEntered={(input, repl) => replEval(program, toggleFlag, input, repl)}
        />
      </div>
    </div>
  );
};

PrimitiveRecursionApp.propTypes = {
  actions: PropTypes.object.isRequired,
  program: PropTypes.object.isRequired
};

function replEval(program, toggleFlag, input, repl) {
  const { text: prelude, decimal, trace: tracing, lazy, force } = program;
  input = input.trim();

  if (input === "") { return; }
  if (input === "trace") { return toggleFlag("trace"); }
  if (input === "decimal") { return toggleFlag("decimal"); }
  if (input === "lazy") { return toggleFlag("lazy"); }
  if (input === "force" || input === "jedi") {
    if (!force) {
      repl.Write("Great, kid. Don't get cocky.\n", "jqconsole-output");
    }
    return toggleFlag("force");
  }

  const expr = muParser(prelude + "\n" + input);

  let trace = () => null;
  let reductions = 0;
  if (tracing) {
    trace = (expr, rules) => {
      repl.Write(`=> {${rules.join(", ")}}`, "repl-trace");
      repl.Write(pretty(expr, { decimal }), "repl-trace");
      reductions++;
    };
  }

  try {
    const result = muEval(expr, trace, { lazy, force });
    const exprType = getTypeOrAlpha(expr);
    const prettyResult = pretty(result, { decimal });
    if (tracing) {
      repl.Write("** " + reductions + " reductions.", "repl-trace");
    }
    repl.Write(prettyResult, "jqconsole-output");
    if (exprType) {
      repl.Write(` :: ${exprType}\n`, "repl-typeof");
    } else {
      repl.Write("\n");
    }
  } catch (e) {
    throw(e);
  }
}

function getTypeOrAlpha(expr) {
  try {
    return getType(expr);
  }
  catch (e) {
    return "α";
  }
}

export default PrimitiveRecursionApp;
