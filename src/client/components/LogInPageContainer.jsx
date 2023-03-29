import React from "react";
import { Link } from "react-router-dom";
// import SignIn
// import SignUp

const LogInPageContainer = () => {
  function clickTest() {
    console.log("Button clicked!");
  }

  return (
    <>
      {/* BELOW IS THE SIGN IN only -- NEED TO MODULARIZE THIS IN OWN FILE & IMPORT ALONG w/ SIGN UP */}
      {/* Logo here */}
      <div>Sign In</div>
      {/* 2 fields here w/ onSubmit form, tied to SIGN IN only */}
      <button onClick={clickTest}>SIGN IN</button>
      <br></br> <br></br>
      <Link to={"https://www.google.com/"}>
        <button>SIGN IN WITH GOOGLE OAUTH</button>
      </Link>
      <br></br> <br></br>
      <Link to={"/main"}>
        <button>CONTINUE AS GUEST</button>
      </Link>
      <br></br> <br></br>
      <Link to={"/signup"}>Sign up here to create an account</Link>
      <br></br> <br></br>
    </>
  );
};

export default LogInPageContainer;
