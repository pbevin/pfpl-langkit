import React, { Component, PropTypes } from "react";
import $ from "jquery";
import "imports?jQuery=jquery!jq-console";

class Repl extends Component {
  componentDidMount() {
    const { welcome } = this.props;
    const jqconsole = $(this.console).jqconsole(welcome + "\n", ">> ", "*> ");
    this.jqconsole = jqconsole;
    jqconsole.RegisterShortcut("U", () => jqconsole.$prompt_left.text(""));
    jqconsole.RegisterShortcut("K", () => jqconsole.$prompt_right.text(""));
    jqconsole.RegisterShortcut("P", () => jqconsole._HistoryPrevious());
    jqconsole.RegisterShortcut("N", () => jqconsole._HistoryNext());
    jqconsole.RegisterShortcut("A", () => jqconsole.MoveToStart());
    jqconsole.RegisterShortcut("E", () => jqconsole.MoveToEnd());
    jqconsole.RegisterShortcut("F", () => jqconsole._MoveRight());
    jqconsole.RegisterShortcut("B", () => jqconsole._MoveLeft());
    jqconsole.RegisterShortcut("D", () => jqconsole._Delete());
    jqconsole.RegisterShortcut("J", () => jqconsole._HandleEnter());

    const startPrompt = () => {
      jqconsole.Prompt(true, input => {
        try {
          this.props.onLineEntered(input, jqconsole);
        }
        catch (e) {
          jqconsole.Write(e.message + "\n", "jqconsole-error");
        }
        startPrompt();
      });
    };
    startPrompt();
  }

  focus() {
    this.jqconsole.Focus();
  }

  render() {
    return <div className="repl-component" ref={e => this.console = e} />;
  }
}

Repl.propTypes = {
  welcome: PropTypes.string.isRequired,
  onLineEntered: PropTypes.func.isRequired
};

export default Repl;
