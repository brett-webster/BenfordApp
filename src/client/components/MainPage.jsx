import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import chartBenfordResults from "../chartResults.js";

const MainPageContainer = ({ outputArr }) => {
  console.log("OutputArr in MainPage: ", outputArr);

  // Grab current page path and pass down props to Navbar so it renders correct button set
  const currentPage = useLocation();
  let currentPagePath = currentPage.pathname;

  // Ensure chart & results are visible
  document.getElementById("chartHanger").style.display = "block";
  // document.getElementById("outputResultsText").style.display = "block";

  // Invoke hiding of chart on button click below
  // function hideChart() {
  //   document.getElementById("chartHanger").style.display = "none";
  // }

  // Print findings, evaluating observed frequency data at 5% and 1% critical value levels
  // console.log(
  //   `For a maximum absolute difference of ${maxKSdifference} (leading digit ${observedMinusBenfordPercentagesAbsDiffsArr.indexOf(
  //     maxKSdifference
  //   )}) between the observed data & the discrete Benford-theoretical curve across ${sumOfLeadingDigitCount} observed leading digits...`
  // );

  const summaryFindings = `For a maximum absolute difference of {maxKSdifference} (leading digit {observedMinusBenfordPercentagesAbsDiffsArr.indexOf(
    maxKSdifference
  )}) between the observed data & the discrete Benford-theoretical curve across {sumOfLeadingDigitCount} observed leading digits...`;
  const results5pcCritical =
    "Fail to reject null hypotheses at the 5% critical level --> CONCLUSION:  Potential Benford conformity";
  // "Reject null hypotheses at the 5% critical level --> CONCLUSION:  Absence of Benford conformity, consider further research\n"
  const results1pcCritical =
    "Fail to reject null hypotheses at the 1% critical level --> CONCLUSION:  Potential Benford conformity";
  // "Reject null hypotheses at the 1% critical level --> CONCLUSION:  Absence of Benford conformity, consider further research\n"

  return (
    <>
      <Navbar currentPagePath={currentPagePath} />
      {chartBenfordResults(outputArr)}
      <br></br>
      <br></br>
      <div id="outputResultsText">
        <div style={{ fontWeight: "bold" }}>Issuer: GE</div>
        <div style={{ fontWeight: "bold" }}>Time Frame: X quarters</div>
        <div style={{ fontWeight: "bold" }}>Digits analyzed: 256</div>
        <br></br> <br></br>
        <div style={{ fontWeight: "bold", textDecorationLine: "underline" }}>
          RESULTS
        </div>
        <div>{summaryFindings}</div>
        <br></br>
        <div style={{ color: "red" }}>{results5pcCritical}</div>
        <div style={{ color: "red" }}>{results1pcCritical}</div>
      </div>

      {/* <div>MAIN PAGE w. CHART</div>
      <Link to="/login">
        <button onClick={hideChart}>GO BACK TO LOGIN</button>
      </Link>
      <br></br> <br></br>
      <Link to="/">
        <button onClick={hideChart}>GO TO LANDING PAGE</button>
      </Link> */}
    </>
  );
};

export default MainPageContainer;
