import React from "react";
const SeachBox = ({ placeholder, className, onChange, ...rest }) => {
  return (
    <input
      type="text"
      className={
        className
          ? `form-control shadow-none ${className}`
          : "form-control shadow-none"
      }
      placeholder={placeholder}
      onChange={onChange}
      {...rest}
    />
  );
};

export default SeachBox;
