import React, { Component, PropTypes } from "react";

import AceEditor from "react-ace";
import "brace";
import "brace/mode/haskell";
import "brace/theme/ambiance";

export default
class CodeEditor extends Component {
  render() {
    const { value, onChange } = this.props;
    return (
      <AceEditor
        mode="haskell"
        theme="ambiance"
        value={value}
        onChange={onChange}
        autoFocus
        width="90%"
        editorProps={{$blockScrolling: true}}
      />
    );
  }
}

CodeEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};
