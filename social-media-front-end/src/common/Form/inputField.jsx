import React from "react";

const Input = ({ name, label, error, ...rest }) => {
  const inputClasses = error
    ? "form-control shadow-none is-invalid"
    : "form-control shadow-none";

  return (
    <div className="form-floating mb-2">
      <input
        name={name}
        placeholder={label}
        className={inputClasses}
        {...rest}
      />
      <label htmlFor={name}>{label}</label>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default Input;
