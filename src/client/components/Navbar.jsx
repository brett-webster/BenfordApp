import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../style.css";
import benfordAppLogo from "../BenfordAppLogo.png";
import { chartDisplayContext } from "../App.jsx"; // ADDED for useContext hook

const Navbar = ({ currentPagePath, setChartDisplayBoolean }) => {
  console.log("Navbar props: ", currentPagePath);

  const chartDisplayBoolean = useContext(chartDisplayContext); // ADDED for useContext hook, pulling it in to access here
  console.log("IN NAV -- chartDisplayBoolean: ", chartDisplayBoolean);
  useEffect(() => {
    console.log(
      "useEffect --> IN NAV -- chartDisplayBoolean: ",
      chartDisplayBoolean
    );
    if (chartDisplayBoolean)
      document.getElementById("chartHanger").style.display = "block";
    if (!chartDisplayBoolean)
      document.getElementById("chartHanger").style.display = "none";
  }, [chartDisplayBoolean]);

  function clearChartHandler() {
    console.log("Clear chart button clicked");
    // document.getElementById("chartHanger").style.display = "none";
    // document.getElementById("outputResultsText").style.display = "none";
    setChartDisplayBoolean(false); // Set state to remove CLEAR CHART button, tied to useContext API
  }

  function logoutHandler() {
    console.log("Logout selected, clearing any uncleared items");
    document.getElementById("chartHanger").style.display = "none";
    // document.getElementById("outputResultsText").style.display = "none";
    setChartDisplayBoolean(false); // ADDED 4/1 11pm -- // Set state to remove CLEAR CHART button, tied to useContext API
  }

  return (
    <nav className="navBar">
      {/* <div>NAVBAR</div> */}
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
        {/* && !chartClearedBoolean */}
        {currentPagePath === "/main" && chartDisplayBoolean ? (
          <button
            onClick={clearChartHandler}
            id="clearChartBtn"
            className="navBtn"
          >
            CLEAR CHART
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
