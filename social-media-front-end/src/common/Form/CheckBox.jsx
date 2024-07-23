import React from "react";

const CheckBox = ({ label, name, value, error, onChange }) => {
  const className = error
    ? "form-check-input shadow-none is-invalid"
    : "form-check-input shadow-none";

  return (
    <div className="form-check text-start mb-3">
      <input
        className={className}
        id={name}
        name={name}
        checked={value}
        onChange={onChange}
        type="checkbox"
      />
      <label className="form-check-label" htmlFor={name}>
        {label}
      </label>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default CheckBox;
