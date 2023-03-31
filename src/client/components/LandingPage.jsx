import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import benfordChart from "../BenfordvsEvenDistributionChart.png"; // ADDED "file-loader" to package.json for importing .png here & new module -> rule in webpack.config.js.  NOTE:  Conflicting dependencies required uninstalling react-hot-loader (though HRM still seems to be working)
import benfordDescription from "../benfordTextDescription.txt"; // ADDED "raw-loader" to package.json for importing .txt here & new module -> rule in webpack.config.js

const LandingPage = () => {
  return (
    <>
      {/* *** HIDE OR REMOVE <div id="chartHanger" FROM dom WHEN GOING FROM EITHER BELOW ENDPOINT */}
      <div>INITIAL LANDING PAGE</div>
      <Link to="/login">
        <button>LOG IN</button>
      </Link>
      <br></br> <br></br>
      <Link to="/signup">
        <button>SIGN UP</button>
      </Link>
      <div>
        {/* className="w-screen h-screen flex items-center justify-center gap-20" */}
        <img src={benfordChart} />
        <br></br>
        <div>{benfordDescription}</div>
      </div>
    </>
  );
};

export default LandingPage;
