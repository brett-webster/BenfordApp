import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../style.css";
import benfordAppLogo from "../BenfordAppLogo.png";

const Navbar = ({ currentPagePath }) => {
  console.log("Navbar props: ", currentPagePath);

  function clearChartHandler() {
    console.log("Clear chart button clicked");
    document.getElementById("chartHanger").style.display = "none";
    document.getElementById("outputResultsText").style.display = "none";
  }

  function logoutHandler() {
    console.log("Logout selected, clearing any uncleared items");
    document.getElementById("chartHanger").style.display = "none";
    document.getElementById("outputResultsText").style.display = "none";
    // ** CHANGE STATE HERE **
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
        {currentPagePath === "/main" ? (
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
