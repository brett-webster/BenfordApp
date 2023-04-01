import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import benfordChart from "../BenfordvsEvenDistributionChart.png"; // ADDED "file-loader" to package.json for importing .png here & new module -> rule in webpack.config.js.  NOTE:  Conflicting dependencies required uninstalling react-hot-loader (though HRM still seems to be working)
import benfordDescription from "../benfordTextDescription.txt"; // ADDED "raw-loader" to package.json for importing .txt here & new module -> rule in webpack.config.js

const LandingPage = () => {
  // Grab current page path and pass down props to Navbar so it renders correct button set
  const currentPage = useLocation();
  let currentPagePath = currentPage.pathname;
  // let currentPagePath;
  // useEffect(() => {
  //   currentPagePath = currentPage.pathname;
  //   console.log("Current page = ", currentPage.pathname);
  // });

  return (
    <>
      {/* *** HIDE OR REMOVE <div id="chartHanger" FROM dom WHEN GOING FROM EITHER BELOW ENDPOINT */}
      <Navbar currentPagePath={currentPagePath} />
      {/* <div>INITIAL LANDING PAGE</div> */}
      {/* <Link to="/login">
        <button>LOG IN</button>
      </Link>
      <br></br> <br></br>
      <Link to="/signup">
        <button>SIGN UP</button>
      </Link> */}
      <div id="benfordChartandDescLandingPage">
        <img
          src={benfordChart}
          style={{
            position: "relative",
            left: 0,
          }}
        />
        <br></br>
        <br></br>
        <div>{benfordDescription}</div>
        <br></br>
        <Link to="https://www.sec.gov/about/what-we-do" target="_blank">
          SEC
        </Link>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span> </span>
        <Link
          to="https://www.sec.gov/edgar/searchedgar/companysearch"
          target="_blank"
        >
          EDGAR
        </Link>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span> </span>
        <Link
          to="https://github.com/brett-webster/BenfordApp#readme"
          target="_blank"
        >
          README
        </Link>
      </div>
    </>
  );
};

export default LandingPage;
