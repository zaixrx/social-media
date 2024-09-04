import React from "react";

function ProgressBar({ percentage }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
    </div>
  );
}

export default ProgressBar;
