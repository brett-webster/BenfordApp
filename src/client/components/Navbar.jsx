import React, { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "../style.css";
import benfordAppLogo from "../BenfordAppLogo.png";
import { chartDisplayContext } from "../App.jsx"; // ADDED for useContext hook

const Navbar = ({ currentPagePath, setChartDisplayBoolean, isProcessing }) => {
  const chartDisplayBoolean = useContext(chartDisplayContext); // ADDED for useContext hook, pulling it in to access here

  // Need useEffect here to read the updated value of changed variable's state following a re-render (in this case tracking the re-setting of the state of chartDisplayBoolean, then displaying/clearing charting)
  useEffect(() => {
    if (chartDisplayBoolean)
      document.getElementById("chartHanger").style.display = "block";
    if (!chartDisplayBoolean)
      document.getElementById("chartHanger").style.display = "none";
  }, [chartDisplayBoolean]);

  function clearResultsHandler() {
    setChartDisplayBoolean(false); // Set state here to remove CLEAR RESULTS button, tied to useContext API
  }

  function logoutHandler() {
    document.getElementById("chartHanger").style.display = "none";
    setChartDisplayBoolean(false); // Set state here to remove CLEAR RESULTS button, tied to useContext API
  }

  return (
    <nav className="navBar">
      <img src={benfordAppLogo} id="benfordAppLogo" />
      <div className="navBtns">
        {currentPagePath === "/" ? (
          <Link to="/login">
            <button id="loginBtn" className="navBtn">
              LOG IN
            </button>
          </Link>
        ) : (
          ""
        )}
        {currentPagePath === "/" ? (
          <Link to="/signup">
            <button id="signupBtn" className="navBtn">
              SIGN UP
            </button>
          </Link>
        ) : (
          ""
        )}
        {/* CLEAR RESULTS button should only be displayed if on /main page AND boolean value's state = TRUE */}
        {/* {currentPagePath === "/main" && chartDisplayBoolean ? ( */}
        {currentPagePath === "/main" && !isProcessing ? ( // CHANGED 4/13 to accomodate loading spinner
          <button
            onClick={clearResultsHandler}
            id="clearResultsBtn"
            className="navBtn"
          >
            CLEAR RESULTS
          </button>
        ) : (
          ""
        )}
        {currentPagePath === "/main" ? (
          <Link to="/">
            <button onClick={logoutHandler} id="logoutBtn" className="navBtn">
              LOG OUT
            </button>
          </Link>
        ) : (
          ""
        )}
      </div>
    </nav>
  );
};

export default Navbar;
