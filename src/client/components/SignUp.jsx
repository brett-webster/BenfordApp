import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  //   const navigate = useNavigate(); // Hook used to proceed to main Benford page upon successful login

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
      console.log("PASSWORD MISMATCH");
      setPasswordMatch(false);
      setNewUser({
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
        console.log(
          "CLIENT-SIDE /api/signup Returned back from Server w/ revision: ",
          response.data
        );
        if (response.data === "DUPLICATE USERNAME") {
          setUserNameDup(true); // Used as flag for displaying message to user
        }
        // else navigate("/main"); // Send user to main page on successful signup
      })();
    }

    // Reset 4 fields here, AFTER data passed from client to server
    setNewUser({
      email: "",
      username: "",
      password: "",
      passwordConfirm: "",
    });
  }

  useEffect(() => {
    console.log("Submit Button clicked! useEffect", newUser);
  });

  return (
    <>
      <div className="w-screen h-screen flex items-center justify-center gap-20 size=50%">
        <img src={lockImage} alt="lockImg" style={{ width: 30 }} />
      </div>
      <div>Sign Up</div>
      <br></br>
      {/* 4 fields here w/ onSubmit form, tied to SIGN UP only */}
      <form onSubmit={submitFormHandler}>
        <label>
          {/* Email: */}
          <input
            type="email"
            name="email"
            placeholder="* Email address *"
            value={newUser.email}
            onChange={charChangeHandler}
            required
          ></input>
        </label>
        <br></br>
        <label>
          {/* Username: */}
          <input
            type="username"
            name="username"
            placeholder="* Username *"
            value={newUser.username}
            onChange={charChangeHandler}
            required
          ></input>
        </label>
        <br></br>
        <label>
          {/* Password: */}
          <input
            type="password"
            name="password"
            placeholder="* Password *"
            value={newUser.password}
            onChange={charChangeHandler}
            required
          ></input>
        </label>
        <br></br>
        <label>
          {/* Confirm Password: */}
          <input
            type="password"
            name="passwordConfirm"
            placeholder="* Confirm Password *"
            value={newUser.passwordConfirm}
            onChange={charChangeHandler}
            required
          ></input>
        </label>
        <br></br> <br></br>
        <button type="submit">SIGN UP</button>
        {/* <button onClick={clickTest}>SIGN UP</button> */}
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
      <br></br> <br></br>
    </>
  );
};

export default SignUp;
