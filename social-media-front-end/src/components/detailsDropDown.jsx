import React from "react";
import DropDownList from "../common/DropDownList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function DetailsDropDown({ expanderID, children }) {
  return (
    <DropDownList
      expanderID={expanderID}
      expanderBody={<FontAwesomeIcon icon="fa-solid fa-ellipsis-vertical" />}
      className="text-secondary btn btn-secondary-soft-hover p-1"
    >
      {children.map((child, index) => (
        <li key={index}>{child}</li>
      ))}
    </DropDownList>
  );
}

export default DetailsDropDown;
