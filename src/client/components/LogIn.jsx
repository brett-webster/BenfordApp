import React, { useState } from "react";
import { Link } from "react-router-dom";

const LogIn = () => {
  function clickTest() {
    console.log("Button clicked!");
  }

  // Ensure any chart is hidden
  document.getElementById("chartHanger").style.display = "none";

  return (
    <div>
      {/* Logo here */}
      <div>Log In</div>
      {/* 2 fields here w/ onSubmit form, tied to LOG IN only */}
      <button onClick={clickTest}>LOG IN</button>
      <br></br> <br></br>
      <Link to="https://www.google.com/">
        <button>SIGN IN WITH GOOGLE OAUTH</button>
      </Link>
      <br></br> <br></br>
      <Link to="/main">
        <button>CONTINUE AS GUEST</button>
      </Link>
      <br></br> <br></br>
      <Link to="/signup">Sign up here to create an account</Link>
      <br></br> <br></br>
    </div>
  );
};

export default LogIn;
