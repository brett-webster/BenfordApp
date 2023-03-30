import React, { useState } from "react";
import { Link } from "react-router-dom";
// import BenfordChart from "../Benford-vs-Even-Distribution-Chart.png";

const LandingPage = () => {
  // Ensure any chart is hidden
  document.getElementById("chartHanger").style.display = "none";

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
        {/* <img src={BenfordChart} /> */}
      </div>
    </>
  );
};

export default LandingPage;
