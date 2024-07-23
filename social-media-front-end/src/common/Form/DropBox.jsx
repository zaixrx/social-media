import React, { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// MainElements => {
//   <input type="file" />
//   <div className="drop-box ..." />
// }
const DropBox = ({ name, nameData, file, label, value, onChange }) => {
  const fileInputRef = useRef(null);

  return (
    <>
      <p className="muted mb-2">{label}</p>
      <div
        onClick={() => fileInputRef.current.click()}
        className="drop-box d-flex flex-column justify-content-center align-items-center w-100 h-100"
      >
        {value ? (
          <>
            <img className="drop-box-file" src={value} />
            <p className="fs-6 mt-2 d-inline-block text-truncate">
              {file.name}
            </p>
          </>
        ) : (
          <>
            <FontAwesomeIcon
              style={{ fontSize: "4rem" }}
              icon="fa-regular fa-image"
            />
            <span className="mt-2">Select a File</span>
          </>
        )}
      </div>
      <input
        type="file"
        accept="image/png, image/jpg, image/gif, image/jpeg"
        name={name}
        nameData={nameData}
        onChange={onChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
    </>
  );
};

export default DropBox;
