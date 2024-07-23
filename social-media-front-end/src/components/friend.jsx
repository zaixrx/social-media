import React from "react";
const Friend = () => {
  return (
    <div className="d-flex pb-3 flex-row align-items-center">
      <img
        src="https://github.com/zaixrx.png"
        height={50}
        width={50}
        className="avatar rounded-circle me-3"
      />
      <div>
        <h6 className="mb-0">Koua Anis</h6>
        <small>Caption</small>
      </div>
    </div>
  );
};

export default Friend;
