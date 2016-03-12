import React, { PropTypes } from "react";

export default
function OptionToggle({ checked, name, setFlag, children }) {
  return (
    <label>
      <input
        type="checkbox"
        className="cb"
        checked={checked}
        onChange={e => setFlag(name, e.target.checked)}
      />
      {children}
    </label>
  );
}

OptionToggle.propTypes = {
  checked: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  setFlag: PropTypes.func.isRequired
};
