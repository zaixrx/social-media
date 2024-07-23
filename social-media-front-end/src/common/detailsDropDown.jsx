import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DetailsDropDown = ({ children }) => {
  let childrenCount = 0;

  return (
    <div className="dropdown">
      <a
        className="text-secondary btn px-2"
        id="cardFeedAction"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <FontAwesomeIcon icon="fa-solid fa-ellipsis-vertical" />
      </a>
      <ul
        className="dropdown-menu dropdown-menu-end"
        aria-labelledby="cardFeedAction"
      >
        {children.map((c) => (
          <li key={++childrenCount}>{c}</li>
        ))}
      </ul>
    </div>
  );
};

export default DetailsDropDown;
