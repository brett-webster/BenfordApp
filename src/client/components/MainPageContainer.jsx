import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import chartBenfordResults from "../chartResults.js";

const MainPageContainer = (props) => {
  const { outputArr } = props;
  console.log("OutputArr in MainPage: ", outputArr);
  chartBenfordResults(outputArr); // Import this from another module

  // Ensure chart is visible
  document.getElementById("chartHanger").style.display = "block";

  return (
    <>
      <div>MAIN PAGE w. CHART</div>
      <Link to="/login">
        <button>GO BACK TO LOGIN</button>
      </Link>
      <br></br> <br></br>
      <Link to="/">
        <button>GO TO LANDING PAGE</button>
      </Link>
    </>
  );
};

export default MainPageContainer;
