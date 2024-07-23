import React from "react";

const TextArea = ({ name, value, placeholder, onChange, ...rest }) => {
  return (
    <textarea
      className="form-control border-0 shadow-none"
      name={name}
      id={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...rest}
    />
  );
};

export default TextArea;
