import React from "react";

function Video({ src, type, className, ...rest }) {
  return (
    <video className={`clickable rounded ${className}`} controls {...rest}>
      <source src={src} type="video/mp4"></source>
    </video>
  );
}

export default Video;
