import React, { useState } from "react";
import { Link } from "react-router-dom";

const SignUp = () => {
  function clickTest() {
    console.log("Button clicked!");
  }

  // Ensure any chart is hidden
  document.getElementById("chartHanger").style.display = "none";

  return (
    <>
      {/* Logo here */}
      <div>Sign Up</div>
      {/* 4 fields here w/ onSubmit form, tied to SIGN UP only */}
      <button onClick={clickTest}>SIGN UP</button>
      <br></br> <br></br>
      <Link to="/login">Already have an account? Log In here...</Link>
      <br></br> <br></br>
    </>
  );
};

export default SignUp;
