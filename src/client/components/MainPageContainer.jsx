import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import chartBenfordResults from "../chartResults.js";

const MainPageContainer = (props) => {
  const { outputArr } = props;
  console.log("OutputArr in MainPage: ", outputArr);
  chartBenfordResults(outputArr); // Import this from another module

  // Ensure chart is visible
  document.getElementById("chartHanger").style.display = "block";

  // Invoke hiding of chart on button click below
  function hideChart() {
    document.getElementById("chartHanger").style.display = "none";
  }

  return (
    <>
      <div>MAIN PAGE w. CHART</div>
      <Link to="/login">
        <button onClick={hideChart}>GO BACK TO LOGIN</button>
      </Link>
      <br></br> <br></br>
      <Link to="/">
        <button onClick={hideChart}>GO TO LANDING PAGE</button>
      </Link>
    </>
  );
};

export default MainPageContainer;
