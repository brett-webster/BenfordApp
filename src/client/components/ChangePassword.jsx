import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import lockImage from "../lockImage.png"; // ADDED "file-loader" to package.json for importing .png here & new module -> rule in webpack.config.js.  NOTE:  Conflicting dependencies required uninstalling react-hot-loader (though HRM still seems to be working)
import axios from "axios";

// STEPS:
// newPassword + confirm MUST match on client-side
// Then, on server-side first confirm username exists
// Next compare currentPassword input vs decrypted version of password in db
// If match, re-write db (but first need to bcrypt hash & save newPassword)...then return updated object to client
// If mismatch, return either "INVALID Username" or "INVALID Current Password"
const ChangePassword = () => {
  const [currentUser, setCurrentUser] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [newPasswordMatch, setNewPasswordMatch] = useState(true);
  const [passwordChangeAccepted, setPasswordChangeAccepted] = useState(true);
  const [newUserObject, setNewUserObject] = useState("STRING PLACEHOLDER");

  // Grab current page path and pass down props to Navbar so it renders correct button set
  const currentPage = useLocation();
  let currentPagePath = currentPage.pathname;

  function charChangeHandler(event) {
    const { name, value } = event.target; // destructure event object
    setCurrentUser({ ...currentUser, [name]: value }); // overwrite latest version of currentUser w/ latest keystroke change
    setNewPasswordMatch(true); // Used to remove user notification of new password mismatch upon 1st field engagement
    setPasswordChangeAccepted(true); // Used to remove user notification of previously entered user info that did not match db
    setNewUserObject("STRING PLACEHOLDER"); // Same as above
  }

  function submitFormHandler(event) {
    event.preventDefault();

    // Confirm password match; if NOT, notify new user & reset form
    if (currentUser.newPassword !== currentUser.newPasswordConfirm) {
      setNewPasswordMatch(false);
      setCurrentUser({
        ...currentUser,
        username: "",
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      });
    }
    // ...else send currentUser password change data to server for validation & processing...
    else {
      (async () => {
        const response = await axios.post("/api/changepassword", {
          currentUser,
        });
        if (
          response.data !== "INVALID Username" &&
          response.data !== "INVALID Current Password"
        ) {
          setNewUserObject(response.data); // Used as flag for displaying message to user
        }
        // Otherwise passwordChangeAccepted remains set to false AND error message displayed on screen
        else {
          setPasswordChangeAccepted(false); // Used as flag for displaying message to user
        }
      })();
    }

    // Reset 4 fields here, only AFTER data passed from client to server
    setCurrentUser({
      ...currentUser,
      username: "",
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    });
  }

  return (
    <>
      <Navbar currentPagePath={currentPagePath} />
      <div id="fullLoginContainer">
        <img src={lockImage} alt="lockImg" style={{ width: 50 }} />
        <br></br> <br></br>
        <div style={{ fontWeight: "bold", textDecorationLine: "underline" }}>
          Change Password
        </div>
        <br></br>
        {/* 4 fields here w/ onSubmit form, tied to CHANGE PASSWORD only */}
        <form onSubmit={submitFormHandler} id="changePasswordForm">
          <label>
            <input
              type="username"
              name="username"
              placeholder="* Username *"
              value={currentUser.username}
              onChange={charChangeHandler}
              required
            ></input>
          </label>
          <label>
            <input
              type="password"
              name="currentPassword"
              placeholder="* Current Password *"
              value={currentUser.currentPassword}
              onChange={charChangeHandler}
              required
            ></input>
          </label>
          <label>
            <input
              type="password"
              name="newPassword"
              placeholder="* New Password *"
              value={currentUser.newPassword}
              onChange={charChangeHandler}
              required
            ></input>
          </label>
          <label>
            <input
              type="password"
              name="newPasswordConfirm"
              placeholder="* Confirm New Password *"
              value={currentUser.newPasswordConfirm}
              onChange={charChangeHandler}
              required
            ></input>
          </label>
          <br></br>
          <button type="submit" className="nonNavBtn">
            CHANGE PASSWORD
          </button>
        </form>
        <br></br> <br></br>
        <div style={{ color: "red" }}>
          {!newPasswordMatch ? "New password mismatch - PLEASE TRY AGAIN" : ""}
        </div>
        <div style={{ color: "red" }}>
          {!passwordChangeAccepted
            ? "Some information is INCORRECT - PLEASE TRY AGAIN"
            : ""}
        </div>
        <div style={{ color: "blue" }}>
          {typeof newUserObject === "object"
            ? "Password Successfully UPDATED, please proceed to Log In..."
            : ""}
        </div>
        <br></br> <br></br>
        <Link to="/login">Return to Log In here...</Link>
      </div>
    </>
  );
};

export default ChangePassword;
