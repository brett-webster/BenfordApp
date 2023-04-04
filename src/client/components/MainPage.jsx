import React, { useState, useEffect, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import axios from "axios";
import magnifyingGlassImage from "../magnifyingGlassImage.png";
import chartBenfordResults from "../chartResults.js";
import { chartDisplayContext } from "../App.jsx"; // ADDED for useContext hook
import getAndSetCompanyCIKtickerList from "../getAndSetCompanyCIKtickerList.jsx";

const MainPage = ({ setChartDisplayBoolean }) => {
  // --------------
  // ** BELOW ADDED TO getAndSetCompanyCIKtickerList **
  // Modularizing this data grab to get company list for dynamic user input
  // Steps in order are:  (1) check whether localStorage populated w/ state variable companyCIKtickerListObj contents and if not, then...
  // ... (2) axios .get() request to server (storing in localStorage & in state)
  // ... no need to check state variable here since by definition will be {} on initial page load
  const [companyCIKtickerListObj, setCompanyCIKtickerListObj] = useState({});

  // BELOW MERELY TESTS FUNCTIONALITY on re-render -- TO REMOVE
  // useEffect(() => {
  //   console.log(
  //     "TRACKING companyCIKtickerListObj state in MainPage.jsx: ",
  //     typeof companyCIKtickerListObj,
  //     companyCIKtickerListObj
  //   );
  //   console.log(
  //     companyCIKtickerListObj["TESLA, INC."],
  //     companyCIKtickerListObj["SERVICENOW, INC."]
  //   );
  //   console.log(
  //     "Object.keys(companyCIKtickerListObj).length: ",
  //     Object.keys(companyCIKtickerListObj).length
  //   );
  // }, [companyCIKtickerListObj]);

  // Only invoke imported helper function on page load of MainPage.jsx
  useEffect(() => {
    // Sets state of company/CIK code look-up list to state variable & in localStorage for future caching
    getAndSetCompanyCIKtickerList(
      companyCIKtickerListObj,
      setCompanyCIKtickerListObj
    );
    // ** INVOKE CODE HERE TO GENERATE AUTOCOMPLETE **
  }, []); // End useEffect

  // --------------

  const chartDisplayBoolean = useContext(chartDisplayContext); // ADDED for useContext hook, pulling it in to access here

  const [inputObject, setInputObject] = useState({
    CIK: "",
    company: "",
    startDate: "",
    endDate: "",
  });
  const [badDateRangeBoolean, setBadDateRangeBoolean] = useState(false);
  const [outputArrayEmptyBoolean, setOutputArrayEmptyBoolean] = useState(false);
  const [outputObject, setOutputObject] = useState({});

  // Grab current page path and pass down props to Navbar so it renders correct button set
  const currentPage = useLocation();
  let currentPagePath = currentPage.pathname;

  // Need useEffect here to read the updated value of changed variable's state following a re-render (in this case tracking the re-setting of the state of chartDisplayBoolean, then displaying/clearing charting)
  useEffect(() => {
    if (chartDisplayBoolean)
      document.getElementById("chartHanger").style.display = "block";
    if (!chartDisplayBoolean)
      document.getElementById("chartHanger").style.display = "none";
  }, [chartDisplayBoolean]);

  function submitFormHandler(event) {
    event.preventDefault();

    // Validate dates selected are acceptable (i.e. startDate < endDate)
    if (inputObject.startDate >= inputObject.endDate) {
      setInputObject({ ...inputObject, startDate: "", endDate: "" });
      setBadDateRangeBoolean(true); // Flag triggering error message to display on-screen
    } else {
      // From server side, validate whether inputs OK
      // RETURN MESSAGE IF:  (1) SAMPLE SIZE OF 0 IS FOUND (0 FINANCIAL STATEMENTS OR LEADING DIGITS THEREIN)
      // ABOVE COVERS VALID CIK BUT THAT LACKS FILINGS AND ALSO VALID CIK W/ FILINGS BUT NO NUMBERS THEREIN; LASTLY, COVERS BAD CIK
      // IN ABOVE CASE, DO NOT OUTPUT CHART, ONLY OUTPUT EMPTY RESULTS
      // Send input data to server for processing...
      // MERGE w/ /api/returnData endpoint to avoid multiple server calls --> /api/inputAndreturnData
      (async () => {
        const response = await axios.post("/api/inputData", { inputObject });

        console.log(
          "CLIENT-SIDE /api/inputdata Returned back from Server w/ revision: ",
          response.data
        );
        // ** ADJUST THE BELOW ** Error handle empty array from server
        if (response.data === "Input data yields EMPTY ARRAY") {
          setOutputArrayEmptyBoolean(true); // Used as flag for message that outputArr contains no digits
          // HIDE ANYTHING ON SCREEN???
        } else {
          console.log(
            "VALID DATA, rendering now (after processing on server-side)..."
          );
          // PROCEED TO RENDER DATA (from bundled object -- "outputObject") RECEIVED IN RESPONSE FROM SERVER (first using loading circle)
        }
      })();

      // **** INSERTED 4/2 6pm -- ** this logic to be combined w/ /api/inputData once integrated on server-side **
      (async () => {
        const response = await axios.get("/api/returnData", {
          responseType: "json",
        });
        const responseObject = JSON.parse(response.data);
        console.log(
          "CLIENT-SIDE /api/returnData: ",
          typeof responseObject,
          responseObject
        );
        setOutputObject(responseObject); // ADDED 4/2 7pm
      })();

      setChartDisplayBoolean(true);
      // Reset 3 fields here, AFTER data passed from client to server
      setInputObject({
        ...inputObject,
        CIK: "",
        company: "",
        startDate: "",
        endDate: "",
      });
    }
  }

  function charChangeHandler(event) {
    event.preventDefault();
    const { name, value } = event.target; // Generic key/value pair input (unknown in advance) to be inserted/overlaid atop current inputObject using spread operator
    setInputObject({ ...inputObject, [name]: value });
    setBadDateRangeBoolean(false); // Used as flag for message that user has entered invalid date range, resetting here to default
    setOutputArrayEmptyBoolean(false); // Used as flag for message that user's input has yielded no numeric leading digits & therefore nothing to display, resetting here to default
  }

  return (
    <>
      <Navbar
        currentPagePath={currentPagePath}
        setChartDisplayBoolean={setChartDisplayBoolean}
      />
      <div id="companyAndDateFormSubmitContainer">
        <img
          src={magnifyingGlassImage}
          alt="magnifyingGlassImg"
          style={{ width: 50 }}
        />
        <br></br> <br></br>
        <div
          style={
            !chartDisplayBoolean
              ? {
                  display: "flex",
                  fontWeight: "bold",
                  textDecorationLine: "underline",
                }
              : { display: "none" }
          }
        >
          Enter Company & Date Range
        </div>
        <br></br>
        <form
          onSubmit={submitFormHandler}
          id="companyAndDateForm"
          style={
            !chartDisplayBoolean ? { display: "flex" } : { display: "none" }
          }
        >
          <label>
            <input
              type="text"
              name="CIK"
              placeholder="* Company name (CIK) *"
              value={inputObject.CIK}
              onChange={charChangeHandler}
              required
            ></input>
          </label>
          <Link
            to="https://www.sec.gov/edgar/searchedgar/companysearch"
            target="_blank"
            style={{ fontSize: "12px", fontFamily: "arial" }}
          >
            Company/CIK lookup
          </Link>
          <br></br>
          <input
            type="date"
            name="startDate"
            value={inputObject.startDate}
            onChange={charChangeHandler}
            min="2010-01-01"
            max={new Date().toJSON().slice(0, 10)} // Today's date
            required
          ></input>
          <input
            type="date"
            name="endDate"
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
        {/* BELOW ARE ERROR MESSAGES -- PRESENTATION CONDITIONAL ON INPUT/OUTPUT */}
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
      {/* Do not render chart if SUBMIT button has not yet been pressed OR CLEAR CHART button has not been clicked post-charting */}
      <div>
        {chartDisplayBoolean && outputObject.resultArr
          ? chartBenfordResults(outputObject.resultArr)
          : ""}
      </div>
      <br></br>
      <br></br>

      {chartDisplayBoolean ? (
        <div id="outputResultsText">
          <div style={{ fontWeight: "bold" }}>
            Issuer: {outputObject.company}
          </div>
          <div style={{ fontWeight: "bold" }}>
            Time Frame: {outputObject.quarters} quarters
          </div>
          <div style={{ fontWeight: "bold" }}>
            Highest Digit Frequency (count):{" "}
            {outputObject.sumOfLeadingDigitCount}
          </div>
          <div style={{ fontWeight: "bold" }}>
            Total Digits analyzed (count): {outputObject.totalDigitCount}
          </div>
          <br></br>
          <div style={{ fontWeight: "bold", textDecorationLine: "underline" }}>
            RESULTS
          </div>
          <div>{`For a maximum absolute difference of ${outputObject.maxKSdifference} (leading digit ${outputObject.leadingDigit}) between the observed data & the discrete Benford-theoretical curve across ${outputObject.totalDigitCount} observed leading digits...`}</div>
          <br></br>
          <div style={{ color: "red" }}>
            {outputObject.results5pcCritical === "REJECT"
              ? "Reject null hypotheses at the 5% critical level --> CONCLUSION:  Absence of Benford conformity, consider further research"
              : "Fail to reject null hypotheses at the 5% critical level --> CONCLUSION:  Potential Benford conformity"}
          </div>
          <div style={{ color: "red" }}>
            {outputObject.results1pcCritical === "REJECT"
              ? "Reject null hypotheses at the 1% critical level --> CONCLUSION:  Absence of Benford conformity, consider further research"
              : "Fail to reject null hypotheses at the 1% critical level --> CONCLUSION:  Potential Benford conformity"}
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default MainPage;
