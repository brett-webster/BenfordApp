import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import lockImage from "../lockImage.png"; // ADDED "file-loader" to package.json for importing .png here & new module -> rule in webpack.config.js.  NOTE:  Conflicting dependencies required uninstalling react-hot-loader (though HRM still seems to be working)
import axios from "axios";

const LogIn = () => {
  const [user, setUser] = useState({ username: "", password: "" });
  const [userANDpasswordMatch, setuserANDpasswordMatch] = useState(true);
  const navigate = useNavigate(); // Hook used to proceed to main Benford page upon successful login

  // Grab current page path and pass down props to Navbar so it renders correct button set
  const currentPage = useLocation();
  let currentPagePath = currentPage.pathname;

  // Redirect straight to /main if already logged in (i.e. cookie present)
  (async () => {
    const response = await axios.get("/api/login");
    if (response.data) navigate("/main"); // Send user to main page if already logged in (i.e. cookie is present & res.locals.loggedInStatus === true)
  })();

  const charChangeHandler = (event) => {
    const { name, value } = event.target; // destructure event object
    setUser({ ...user, [name]: value }); // overwrite latest version of user w/ latest keystroke change
    setuserANDpasswordMatch(true); // Used to remove user notification sent by server that username/password combo is invalid
  };

  function submitFormHandler(event) {
    event.preventDefault();

    // Send user login data to server for processing...
    (async () => {
      const response = await axios.post("/api/login", { user });
      if (
        response.data === "INVALID Username" ||
        response.data === "INVALID Password"
      ) {
        setuserANDpasswordMatch(false); // Used as flag for  message that username/password combo is invalid
      } else navigate("/main"); // Send user to main page on successful login
    })();

    // Reset 2 fields here, AFTER data passed from client to server
    setUser({ ...user, username: "", password: "" });
  }

  return (
    <>
      <Navbar currentPagePath={currentPagePath} />
      <div id="fullLoginContainer">
        <img src={lockImage} alt="lockImg" style={{ width: 50 }} />
        <br></br> <br></br>
        <div style={{ fontWeight: "bold", textDecorationLine: "underline" }}>
          Log In
        </div>
        <br></br>
        {/* 2 fields here w/ onSubmit form, tied to LOG IN only */}
        <form onSubmit={submitFormHandler} id="loginForm">
          <label>
            <input
              type="username"
              name="username"
              placeholder="* Username *"
              value={user.username}
              onChange={charChangeHandler}
              required
            ></input>
          </label>
          <label>
            <input
              type="password"
              name="password"
              placeholder="* Password *"
              value={user.password}
              onChange={charChangeHandler}
              required
            ></input>
          </label>
          <br></br>
          <button type="submit" className="nonNavBtn">
            LOG IN
          </button>
        </form>
        <br></br> <br></br>
        <Link to="">
          <button className="nonNavBtn">SIGN IN WITH GOOGLE OAUTH</button>
        </Link>
        <br></br>
        <Link to="/main">
          <button className="nonNavBtn">CONTINUE AS GUEST</button>
        </Link>
        <br></br> <br></br>
        <div style={{ color: "red" }}>
          {!userANDpasswordMatch
            ? "Username and/or password invalid - PLEASE TRY AGAIN"
            : ""}
        </div>
        <br></br> <br></br>
        <Link to="/signup">Sign up here to create an account</Link>
        <br></br>
        <Link to="/changepassword">Change password here...</Link>
      </div>
    </>
  );
};

export default LogIn;
