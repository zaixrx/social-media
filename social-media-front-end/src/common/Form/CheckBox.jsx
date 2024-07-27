import React from "react";

const CheckBox = ({ name, label, error, ...rest }) => {
  const className = error
    ? "form-check-input shadow-none is-invalid"
    : "form-check-input shadow-none";

  return (
    <div className="form-check text-start mb-3">
      <input className={className} name={name} type="checkbox" {...rest} />
      <label className="form-check-label" htmlFor={name}>
        {label}
      </label>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default CheckBox;
