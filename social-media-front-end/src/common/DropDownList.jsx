import React from "react";

function DropDownList({ expanderID, expanderBody, children, className }) {
  return (
    <div className="dropdown">
      <a
        id={expanderID}
        data-bs-toggle="dropdown"
        aria-expanded="false"
        className={className}
      >
        {expanderBody}
      </a>
      <ul
        className="dropdown-menu dropdown-menu-end py-0"
        aria-labelledby={expanderID}
      >
        {children}
      </ul>
    </div>
  );
}

export default DropDownList;
