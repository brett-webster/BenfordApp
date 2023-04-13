import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

const ProcessingSpinner = () => {
  return (
    <div
      style={{
        width: "150px",
        margin: "auto",
        display: "block",
      }}
    >
      <ClipLoader color="lightgrey" size={150} />
    </div>
  );
};

export default ProcessingSpinner;
