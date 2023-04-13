import React from "react";
// import ClipLoader from "react-spinners/ClipLoader";  // Standard spinner
import PacmanLoader from "react-spinners/PacmanLoader"; // This fits the bill

const ProcessingSpinner = () => {
  return (
    <div
      style={{
        width: "150px",
        margin: "auto",
        display: "block",
      }}
    >
      {/* <ClipLoader color="lightgrey" size={150} /> */}
      <PacmanLoader color="lightgrey" size={50} />
    </div>
  );
};

export default ProcessingSpinner;
