import React from "react";
import SeachBox from "./SearchBox";

const DropDownSearchBox = ({ children, placeholder, className, onChange }) => {
  function isValid() {
    return true;
  }

  return (
    <>
      <div
        className={
          className ? `dropdown text-end ${className}` : "dropdown text-end"
        }
      >
        <SeachBox
          onChange={onChange}
          placeholder={placeholder}
          data-bs-toggle={isValid() && "dropdown"}
        />
        {isValid() && (
          <ul className="dropdown-menu text-small">
            {children?.map((child) => child)}
          </ul>
        )}
      </div>
    </>
  );
};

export default DropDownSearchBox;
