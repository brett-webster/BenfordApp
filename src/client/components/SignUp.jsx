import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import lockImage from "../lockImage.png"; // ADDED "file-loader" to package.json for importing .png here & new module -> rule in webpack.config.js.  NOTE:  Conflicting dependencies required uninstalling react-hot-loader (though HRM still seems to be working)
import axios from "axios";

const SignUp = () => {
  const [newUser, setNewUser] = useState({
    email: "",
    username: "",
    password: "",
    passwordConfirm: "",
  });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [userNameDup, setUserNameDup] = useState(false);
  const navigate = useNavigate(); // Hook used to proceed to main Benford page upon successful login

  // Grab current page path and pass down props to Navbar so it renders correct button set
  const currentPage = useLocation();
  let currentPagePath = currentPage.pathname;

  // Redirect straight to /main if already logged in (i.e. cookie present)
  (async () => {
    const response = await axios.get("/api/signup");
    console.log("response.data:  ", response.data);
    if (response.data) navigate("/main"); // Send user to main page if already logged in (i.e. cookie is present & res.locals.loggedInStatus === true)
  })();

  function charChangeHandler(event) {
    const { name, value } = event.target; // destructure event object
    setNewUser({ ...newUser, [name]: value }); // overwrite latest version of newUser w/ latest keystroke change
    setPasswordMatch(true); // Used to remove user notification of password mismatch upon 1st field engagement
    setUserNameDup(false); // Used to remove user notification of previously entered username duplicate upon 1st field engagement
  }

  function submitFormHandler(event) {
    event.preventDefault();

    // Confirm password match; if NOT, notify new user & reset form
    if (newUser.password !== newUser.passwordConfirm) {
      setPasswordMatch(false);
      setNewUser({
        ...newUser,
        email: "",
        username: "",
        password: "",
        passwordConfirm: "",
      });
    }
    // ...else send newUser signup data to server for processing...
    else {
      (async () => {
        const response = await axios.post("/api/signup", { newUser });
        if (response.data === "DUPLICATE Username") {
          setUserNameDup(true); // Used as flag for displaying message to user
        } else navigate("/main"); // Send user to main page on successful signup
      })();
    }

    // Reset 4 fields here, only AFTER data passed from client to server
    setNewUser({
      ...newUser,
      email: "",
      username: "",
      password: "",
      passwordConfirm: "",
    });
  }

  return (
    <>
      <Navbar currentPagePath={currentPagePath} />
      <div id="fullLoginContainer">
        <img src={lockImage} alt="lockImg" style={{ width: 50 }} />
        <br></br> <br></br>
        <div style={{ fontWeight: "bold", textDecorationLine: "underline" }}>
          Sign Up
        </div>
        <br></br>
        {/* 4 fields here w/ onSubmit form, tied to SIGN UP only */}
        <form onSubmit={submitFormHandler} id="signupForm">
          <label>
            <input
              type="email"
              name="email"
              placeholder="* Email address *"
              value={newUser.email}
              onChange={charChangeHandler}
              required
            ></input>
          </label>
          <label>
            <input
              type="username"
              name="username"
              placeholder="* Username *"
              value={newUser.username}
              onChange={charChangeHandler}
              required
            ></input>
          </label>
          <label>
            <input
              type="password"
              name="password"
              placeholder="* Password *"
              value={newUser.password}
              onChange={charChangeHandler}
              required
            ></input>
          </label>
          <label>
            <input
              type="password"
              name="passwordConfirm"
              placeholder="* Confirm Password *"
              value={newUser.passwordConfirm}
              onChange={charChangeHandler}
              required
            ></input>
          </label>
          <br></br>
          <button type="submit" className="nonNavBtn">
            SIGN UP
          </button>
        </form>
        <br></br> <br></br>
        <div style={{ color: "red" }}>
          {!passwordMatch ? "Password mismatch - PLEASE TRY AGAIN" : ""}
        </div>
        <div style={{ color: "blue" }}>
          {userNameDup
            ? "Duplicate username found in database - PLEASE TRY AGAIN"
            : ""}
        </div>
        <br></br>
        <Link to="/login">Already have an account? Log In here...</Link>
      </div>
    </>
  );
};

export default SignUp;
