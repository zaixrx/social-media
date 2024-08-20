import React, { useState } from "react";
import { schemas } from "./formData";
import Joi from "joi";

function FormTextArea({
  setter,
  label,
  innerRef,
  className = "",
  validationPath,
  ...rest
}) {
  const [error, setError] = useState("");
  const name = `input-${label.replaceAll(" ", "").toLowerCase()}`;

  function validate(value) {
    if (!validationPath) return;

    const schema = new Joi.object({
      [validationPath]: _.get(schemas, validationPath),
    });
    const { error: error } = schema.validate({ [validationPath]: value });
    setError(error && error.details[0].message);
  }

  return (
    <div className="form-floating">
      <textarea
        name={name}
        ref={innerRef}
        onChange={({ target }) => {
          validate(target.value);
          setter(target.value);
        }}
        className={`form-control shadow-none ${
          error && "border-danger"
        } ${className}`}
        placeholder={label}
        {...rest}
      ></textarea>
      <label htmlFor={name}>{label}</label>
      {error && <div className="text-danger">{error}</div>}
    </div>
  );
}

export default FormTextArea;
