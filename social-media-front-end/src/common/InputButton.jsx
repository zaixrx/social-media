import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function InputButton({ placeholder, icon }) {
  const [editMode, setEditMode] = useState(false);
  const editInput = useRef();

  return (
    <div style={{ display: editMode ? "block" : "none" }}>
      <div className="input-group">
        <input
          type="text"
          ref={editInput}
          placeholder="Edit Message"
          className="form-control shadow-none"
          onKeyDown={handleKeyDown}
        />
        <button onClick={localEditMessage} className="btn btn-primary">
          <FontAwesomeIcon icon="fa-regular fa-paper-plane" />
        </button>
      </div>
    </div>
  );
}

export default InputButton;
