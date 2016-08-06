import React, { PropTypes } from "react";

import AceEditor from "react-ace";
import "brace";
import "brace/mode/haskell";
import "brace/mode/lisp";
import "brace/theme/ambiance";

const langToMode = {
  syst: "haskell",
  dpcf: "lisp"
};

function CodeEditor({ value, onChange, lang }) {
  const mode = langToMode[lang];

  return (
    <AceEditor
      mode={mode}
      theme="ambiance"
      value={value}
      onChange={onChange}
      autoFocus
      width="90%"
      editorProps={{$blockScrolling: true}}
    />
  );
}

CodeEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default CodeEditor;
