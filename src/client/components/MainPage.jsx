import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import axios from "axios";
import magnifyingGlassImage from "../magnifyingGlassImage.png";
import chartBenfordResults from "../chartResults.js";

const MainPageContainer = ({ outputArr }) => {
  // console.log("OutputArr in MainPage: ", outputArr);

  // Grab current page path and pass down props to Navbar so it renders correct button set
  const currentPage = useLocation();
  let currentPagePath = currentPage.pathname;

  const [inputObject, setInputObject] = useState({
    CIK: "",
    Company: "",
    startDate: "",
    endDate: "",
  });
  const [badDateRangeBoolean, setBadDateRangeBoolean] = useState(false);
  const [outputArrayEmptyBoolean, setOutputArrayEmptyBoolean] = useState(false);

  // Ensure chart & results are visible
  document.getElementById("chartHanger").style.display = "block";
  document.getElementById("chartHanger").style.display = "none"; // REMOVE
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

  function submitFormHandler(event) {
    event.preventDefault();
    console.log("Form submit button clicked, inputObject = ", inputObject);

    // Add leading digits to CIK code, if length is less than 10
    let fullCIK = inputObject.CIK.slice();
    console.log(fullCIK);
    for (let i = inputObject.CIK.length; i < 10; i++) {
      fullCIK = "0" + fullCIK;
    }
    setInputObject({ ...inputObject, ["CIK"]: fullCIK });
    console.log(fullCIK, inputObject.CIK);

    // Validate dates selected are acceptable (i.e. startDate < endDate)
    if (inputObject.startDate >= inputObject.endDate) {
      console.log("Error:  Date range is incorrect.  PLEASE TRY AGAIN");
      setInputObject({ ...inputObject, startDate: "", endDate: "" });
      setBadDateRangeBoolean(true); // Display the above console.log on screen
    } else {
      // From server side, validate whether inputs OK
      // RETURN MESSAGE IF:  (1) SAMPLE SIZE OF 0 IS FOUND (0 FINANCIAL STATEMENTS OR LEADING DIGITS THEREIN)
      // ABOVE COVERS VALID CIK BUT THAT LACKS FILINGS AND ALSO VALID CIK W/ FILINGS BUT NO NUMBERS THEREIN; LASTLY, COVERS BAD CIK
      // IN ABOVE CASE, DO NOT OUTPUT CHART, ONLY OUTPUT EMPTY RESULTS
      // Send input data to server for processing...
      console.log("last chance: ", inputObject);
      (async () => {
        const response = await axios.post("/api/inputdata", { inputObject });

        console.log(
          "CLIENT-SIDE /api/inputdata Returned back from Server w/ revision: ",
          response.data
        );
        // ** ADJUST THE BELOW ** Error handle empty array from server
        if (response.data === "Input data yields EMPTY ARRAY") {
          setOutputArrayEmptyBoolean(true); // Used as flag for message that outputArr contains no digits
          // HIDE ANYTHING ON SCREEN???
        } else {
          console.log("VALID DATA, rendering now...");
          // PROCEED TO RENDER DATA (first using loading circle)
        }
      })();

      // Reset 3 fields here, AFTER data passed from client to server
      setInputObject({
        ...inputObject,
        CIK: "",
        Company: "",
        startDate: "",
        endDate: "",
      });
    }
  }

  function charChangeHandler(event) {
    event.preventDefault();
    const { name, value } = event.target; // Generic key/value pair input (unknown in advance) to be inserted/overlaid atop current inputObject using spread operator
    setInputObject({ ...inputObject, [name]: value });
    console.log("Char change: ", inputObject.CIK, event.target.value);
    setBadDateRangeBoolean(false); // Used as flag for message that user has entered invalid date range, resetting here to default
    setOutputArrayEmptyBoolean(false); // Used as flag for message that user's input has yielded no numeric leading digits & therefore nothing to display, resetting here to default
  }

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
      <div id="companyAndDateFormSubmitContainer">
        <img
          src={magnifyingGlassImage}
          alt="magnifyingGlassImg"
          style={{ width: 50 }}
        />
        <br></br> <br></br>
        <div style={{ fontWeight: "bold", textDecorationLine: "underline" }}>
          Enter Company & Date Range
        </div>
        <br></br>
        <form onSubmit={submitFormHandler} id="companyAndDateForm">
          <label>
            {/* Company name/CIK: */}
            <input
              type="text"
              name="CIK"
              placeholder="* Company name (CIK) *"
              value={inputObject.CIK}
              onChange={charChangeHandler}
              required
            ></input>
          </label>
          <input
            type="date"
            name="startDate"
            // placeholder="* Start Date *"
            value={inputObject.startDate}
            onChange={charChangeHandler}
            min="2010-01-01"
            max={new Date().toJSON().slice(0, 10)} // Today's date
            required
          ></input>
          <input
            type="date"
            name="endDate"
            // placeholder="* End Date *"
            value={inputObject.endDate}
            onChange={charChangeHandler}
            min="2010-01-01"
            max={new Date().toJSON().slice(0, 10)} // Today's date
            required
          ></input>
          <br></br>
          <button type="submit" className="nonNavBtn">
            <div>SUBMIT</div>
          </button>
        </form>
        <br></br> <br></br>
        {/* BELOW ARE ERROR MESSAGES, PRESENTATION CONDITIONAL ON INPUT/OUTPUT */}
        <div style={{ color: "red" }}>
          {badDateRangeBoolean
            ? "Error:  Date range is incorrect.  PLEASE TRY AGAIN"
            : ""}
        </div>
        <div style={{ color: "red" }}>
          {outputArrayEmptyBoolean
            ? "Company and Date Range input has yielded no results.  PLEASE TRY AGAIN"
            : ""}
        </div>
      </div>

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
