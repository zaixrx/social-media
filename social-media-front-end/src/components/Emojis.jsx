import React, { useEffect, useState } from "react";
import { emojis as emojisData } from "../utils/emojis.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DropDownList from "../common/DropDownList.jsx";

function Emojis({ onEmojiSelected }) {
  const [emojis, setEmojis] = useState([]);

  useEffect(() => {
    setEmojis(emojisData);
  }, []);

  return (
    <DropDownList
      expanderID={"emojisCard"}
      expanderBody={
        <FontAwesomeIcon className="text-secondary" icon="fa-solid fa-icons" />
      }
      className="text-secondary btn btn-secondary-soft-hover p-1"
    >
      <div className="d-flex">
        {emojis?.map((emoji, index) => (
          <li
            key={index}
            className="px-2 dropdown-item clickable fs-5"
            onClick={() => onEmojiSelected(emoji)}
          >
            {emoji}
          </li>
        ))}
      </div>
    </DropDownList>
  );
}

export default Emojis;
