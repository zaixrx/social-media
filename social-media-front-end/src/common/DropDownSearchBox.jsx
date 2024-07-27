import React from "react";
import { NavLink } from "react-router-dom";
import SeachBox from "./SearchBox";

const DropDownSearchBox = ({ items, placeholder, className, onChange }) => {
  let itemsCount = 0;

  const isValid = () => items !== undefined;

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
            {items.map((item) => (
              <li key={++itemsCount}>
                <NavLink className="dropdown-item" to={item.to}>
                  {item.text}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default DropDownSearchBox;
