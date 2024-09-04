import React from "react";

function FormCheckBox({
  checked,
  checkBoxID,
  checkBoxName,
  className = "",
  onChange,
  ...rest
}) {
  return (
    <div className={`form-check ${className}`} {...rest}>
      <input
        checked={checked}
        className="form-check-input"
        type="checkbox"
        id={checkBoxID}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label className="form-check-label" htmlFor={checkBoxID}>
        {checkBoxName}
      </label>
    </div>
  );
}

export default FormCheckBox;
