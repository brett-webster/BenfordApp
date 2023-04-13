import React, { useState, useEffect, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import axios from "axios";
import magnifyingGlassImage from "../magnifyingGlassImage.png";
import chartBenfordResults from "../chartResults.js";
import { chartDisplayContext } from "../App.jsx"; // ADDED for useContext hook
import getAndSetCompanyCIKtickerList from "../getAndSetCompanyCIKtickerList.jsx";
import CompanyInputAutocomplete from "./CompanyInputAutocomplete.jsx";
import BenfordResultsText from "./BenfordResultsText.jsx";
import ProcessingSpinner from "./ProcessingSpinner.jsx";

const MainPage = ({ setChartDisplayBoolean }) => {
  // State variables
  const [inputObject, setInputObject] = useState({
    CIK: "",
    company: "",
    ticker: "",
    startDate: "",
    endDate: "",
  });
  const [badDateRangeBoolean, setBadDateRangeBoolean] = useState(false);
  const [outputArrayEmptyBoolean, setOutputArrayEmptyBoolean] = useState(false);
  const [outputObject, setOutputObject] = useState({});
  const [companyCIKtickerListObj, setCompanyCIKtickerListObj] = useState({});
  const [companyListArr, setCompanyListArr] = useState([]);
  // Default set of state w/ descriptions -- set state w/ hook
  const initialAutocompleteState = {
    // The active selection's index
    activeSuggestion: 0,
    // The suggestions that match the user's input
    filteredSuggestions: [],
    // Whether or not the suggestion list is shown
    showSuggestions: false,
    // What the user has entered
    userInput: "",
  };
  const [autocompleteState, setAutocompleteState] = useState(
    initialAutocompleteState
  );
  const [isProcessing, setIsProcessing] = useState(false); // ADDED 4/13 for spinner

  // ADDED for useContext hook, pulling it in to access here
  const chartDisplayBoolean = useContext(chartDisplayContext);

  // Grab current page path and pass down props to Navbar so it renders correct button set
  const currentPage = useLocation();
  let currentPagePath = currentPage.pathname;

  // START of useEffect hooks

  // getAndSetCompanyCIKtickerList.jsx:  Modularizing this data grab to get company list for dynamic user input
  // Steps in order are:  (1) check whether localStorage is populated w/ state variable companyCIKtickerListObj contents;
  // ...if not, then (2) send axios .get() request to server (storing response object in localStorage & in state)
  // ...no need to check state variable here since by definition will be {} on initial page load
  useEffect(() => {
    // Sets state of company/CIK code look-up list to state variable & in localStorage for future caching
    getAndSetCompanyCIKtickerList(
      companyCIKtickerListObj,
      setCompanyCIKtickerListObj
    );
  }, []); // End useEffect -->  Invoke imported helper function ONLY on page load of MainPage.jsx to grab & store object

  // Create array of company names in ascending order to be passed down as props to CompanyInputAutocomplete.jsx
  useEffect(() => {
    // Iterate thru newly created object (companyCIKtickerListObj) to create array -- object eliminated dups, sorted array of company names is needed for auto-complete code & passed down to child component as props
    const arrList = [];
    for (const companyName in companyCIKtickerListObj) {
      arrList.push(companyName);
    }
    arrList.sort();
    setCompanyListArr(arrList);
  }, [companyCIKtickerListObj]); // End useEffect --> ONLY on update to companyCIKtickerListObj (above)

  // Autocomplete -- set state of inputObject (company, CIK, ticker) to be passed to server
  useEffect(() => {
    const companyName = autocompleteState.userInput;
    // To avoid errors, ONLY set state of input object if companyCIKtickerListObj is populated AND companyName has been input AND is present in object
    if (
      Object.keys(companyCIKtickerListObj).length !== 0 &&
      companyCIKtickerListObj[companyName]
    ) {
      // Find company CIK code & ticker in companyCIKtickerListObj based on name submitted; assign these to inputObj BEFORE posting to server
      const CIK = companyCIKtickerListObj[companyName][0];
      const ticker = companyCIKtickerListObj[companyName][1];
      setInputObject({
        ...inputObject,
        company: companyName,
        CIK: CIK,
        ticker: ticker,
      });
    }
  }, [autocompleteState]); // End useEffect --> ONLY on update to autocompleteState (i.e. when company name has updated)

  // Need useEffect here to read the updated value of changed variable's state following a re-render (in this case tracking the re-setting of the state of chartDisplayBoolean, then displaying/clearing charting)
  useEffect(() => {
    if (chartDisplayBoolean) {
      document.getElementById("chartHanger").style.display = "block";
      document.getElementById("userInputYieldedNoResultsMsg").style.display =
        "block"; // ADDED 4/9
    }
    if (!chartDisplayBoolean) {
      document.getElementById("chartHanger").style.display = "none";
      document.getElementById("userInputYieldedNoResultsMsg").style.display =
        "none"; // ADDED 4/9
    }
  }, [chartDisplayBoolean]); // End useEffect --> ONLY on update to chartDisplayBoolean flag
  // End of useEffect hooks

  useEffect(() => {
    if (Object.keys(outputObject).length > 0) {
      document.getElementById("chartHanger").style.display = "block";
      document.getElementById("outputResultsText").style.display = "block";
    } else {
      document.getElementById("chartHanger").style.display = "none";
      document.getElementById("outputResultsText").style.display = "none";
    }
  }, [outputObject]); // ADDED 4/9

  // const spinnerContent = (
  //   <div id="spinner">
  //     <ProcessingSpinner />
  //   </div>
  // );
  // useEffect(() => {
  // console.log("isProcessing BOOL: ", isProcessing); // REMOVE
  // console.log(spinnerContent); // REMOVE
  // }, [isProcessing]); // ADDED 4/13 for spinner - TESTING ONLY, REMOVE

  // ---------------

  // Below submitFormHandler & charChangeHandler functions invoked in return portion of component
  function submitFormHandler(event) {
    event.preventDefault();
    setOutputObject({}); // ADDED 4/9
    console.log(
      "Submitted data in MainPage, CLIENT-SIDE pre-server: ",
      inputObject
    );
    // Validate dates selected are acceptable (i.e. startDate < endDate)
    if (inputObject.startDate >= inputObject.endDate) {
      setInputObject({ ...inputObject, startDate: "", endDate: "" });
      setBadDateRangeBoolean(true); // Flag triggering error message to display on-screen
    } else {
      // From server side, validate whether inputs are OK
      // RETURN MESSAGE IF:  (1) SAMPLE SIZE OF 0 IS FOUND (0 FINANCIAL STATEMENTS OR LEADING DIGITS THEREIN)
      // ABOVE COVERS VALID CIK BUT THAT LACKS FILINGS AND ALSO VALID CIK W/ FILINGS BUT NO NUMBERS THEREIN; LASTLY, COVERS BAD CIK (BUT THIS IS NOT RELEVANT SINCE PRE-FILTERED)
      // IN ABOVE CASE, DO NOT OUTPUT CHART, ONLY OUTPUT EMPTY RESULTS
      // Send input data to server for processing & response...
      setIsProcessing(true); // ADDED 4/13 for spinner -- Turn ON spinner
      (async () => {
        const response = await axios.post("/api/inputAndReturnData", {
          inputObject,
        });
        setIsProcessing(false); // ADDED 4/13 for spinner -- Turn OFF spinner)
        if (response.data.outputDataIsEmptyBoolean) {
          setOutputArrayEmptyBoolean(true); // Used as flag for message that outputArr contains no digits
        } else {
          console.log(
            "VALID DATA, rendering now (after processing on server-side)..."
          );
          console.log(
            "CLIENT-SIDE /api/inputAndreturnData Returned back from Server w/ ADDITIONS: ",
            typeof response.data,
            response.data
          );
          setOutputObject(response.data);
          // PROCEED TO RENDER DATA (from bundled object -- "outputObject") RECEIVED IN RESPONSE FROM SERVER (first using loading circle)
          console.log("SUCCESS!!  ", response.data);
        }
      })();

      setChartDisplayBoolean(true);
      // Reset fields here, AFTER data passed from client to server
      setInputObject({
        ...inputObject,
        CIK: "",
        company: "",
        ticker: "",
        startDate: "",
        endDate: "",
      });
    }
  }

  // Applies ONLY to data range; autocomplete logic found in CompanyInputAutocomplete.jsx
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
        isProcessing={isProcessing} // ADDED 4/13 to accomodate loading spinner
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
          <CompanyInputAutocomplete
            companyListArr={companyListArr}
            chartDisplayBoolean={chartDisplayBoolean}
            setAutocompleteState={setAutocompleteState}
            autocompleteState={autocompleteState}
          />
          <Link
            to="https://www.sec.gov/edgar/searchedgar/companysearch"
            target="_blank"
            style={{
              fontSize: "12px",
              fontFamily: "Arial, sans-serif",
              marginTop: "5px",
            }}
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
            style={{ fontSize: "13px", fontFamily: "Arial, sans-serif" }}
            required
          ></input>
          <input
            type="date"
            name="endDate"
            value={inputObject.endDate}
            onChange={charChangeHandler}
            min="2010-01-01"
            max={new Date().toJSON().slice(0, 10)} // Today's date
            style={{ fontSize: "13px", fontFamily: "Arial, sans-serif" }}
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
        <div id="userInputYieldedNoResultsMsg" style={{ color: "red" }}>
          {outputArrayEmptyBoolean
            ? "Company and Date Range input has yielded no results.  PLEASE TRY AGAIN"
            : ""}
        </div>
      </div>
      {/* LOADING SPINNER ADDED FOR DATA PROCESSING -- DISCONTINUE WHEN RESULTS ARE READY & CHART IS PRESENTED */}
      <div>{isProcessing ? <ProcessingSpinner /> : null}</div>
      {/* Do not render chart if SUBMIT button has not yet been pressed OR CLEAR RESULTS button has not been clicked post-charting */}
      <div>
        {chartDisplayBoolean && outputObject.arrForChart
          ? chartBenfordResults(outputObject.arrForChart)
          : ""}
      </div>
      <br></br>
      <br></br>
      <BenfordResultsText
        chartDisplayBoolean={chartDisplayBoolean}
        outputObject={outputObject}
      />
    </>
  );
};

export default MainPage;
