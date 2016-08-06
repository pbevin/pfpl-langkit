import React, { PropTypes } from "react";
import OptionToggle from "./OptionToggle";

const Options = ({ program, actions }) => {
  const { lang } = program;
  const handleLangChange = e => actions.setLanguage(e.target.value);

  return (
    <div className="options">
      <div className="repl-options">
        <select name="lang" value={lang} onChange={handleLangChange}>
          <option value="syst">System T (chapter 9)</option>
          <option value="dpcf">DPCF (chapter 22)</option>
        </select>
      </div>

      {toggleOptions(program, actions)}
    </div>
  );
};

Options.propTypes = {
  program: PropTypes.shape({
    lang: PropTypes.string.isRequired,
    trace: PropTypes.bool.isRequired,
    decimal: PropTypes.bool.isRequired,
    lazy: PropTypes.bool.isRequired,
    force: PropTypes.bool.isRequired
  }).isRequired,
  actions: PropTypes.shape({
    setLanguage: PropTypes.func.isRequired,
    setFlag: PropTypes.func.isRequired
  }).isRequired
};

function toggleOptions(program, { setFlag }) {
  switch (program.lang) {
    case "syst":
      return systOptions(program, setFlag);
    case "dpcf":
      return dpcfOptions(program, setFlag);
  }
}

function systOptions(program, setFlag) {
  const { trace, decimal, lazy, force } = program;

  return (
    <div className="toggle">
      <div className="repl-options">
        <OptionToggle checked={lazy} name="lazy" setFlag={setFlag}>
          Lazy Evaluation
        </OptionToggle>
        <OptionToggle checked={force} name="force" setFlag={setFlag}>
          Use The Force
        </OptionToggle>
      </div>

      <div className="repl-options">
        <OptionToggle checked={trace} name="trace" setFlag={setFlag}>
          Trace Execution
        </OptionToggle>
        <OptionToggle checked={decimal} name="decimal" setFlag={setFlag}>
          Show Decimal Values
        </OptionToggle>
      </div>
    </div>
  );
}

function dpcfOptions(program, setFlag) {
  const { trace } = program;

  return (
    <div className="repl-options">
      <OptionToggle checked={trace} name="trace" setFlag={setFlag}>
        Trace Execution
      </OptionToggle>
    </div>
  );
}

export default Options;
