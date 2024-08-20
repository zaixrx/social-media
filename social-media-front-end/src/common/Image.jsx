import React from "react";

function Image({ src, className, ...rest }) {
  return (
    <img
      src={src}
      className={`clickable border avatar ${className}`}
      {...rest}
      onClick={() => {
        window.open(src);
      }}
    />
  );
}

export default Image;
