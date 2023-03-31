import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import lockImage from "../lockImage.png"; // ADDED "file-loader" to package.json for importing .png here & new module -> rule in webpack.config.js.  NOTE:  Conflicting dependencies required uninstalling react-hot-loader (though HRM still seems to be working)
import axios from "axios";

const LogIn = () => {
  const [user, setUser] = useState({
    username: "",
    password: "",
  });
  const [userANDpasswordMatch, setuserANDpasswordMatch] = useState(true);
  //   const navigate = useNavigate(); // Hook used to proceed to main Benford page upon successful login

  const charChangeHandler = (event) => {
    const { name, value } = event.target; // destructure event object
    setUser({ ...user, [name]: value }); // overwrite latest version of user w/ latest keystroke change
    setuserANDpasswordMatch(true); // Used to remove user notification sent by server that username/password combo is invalid
  };

  function submitFormHandler(event) {
    event.preventDefault();
    console.log("user/pass: ", user);

    // Send user login data to server for processing...
    (async () => {
      const response = await axios.post("/api/login", { user });

      console.log(
        "CLIENT-SIDE /api/login Returned back from Server w/ revision: ",
        response.data
      );
      if (response.data === "INVALID Username/Password") {
        setuserANDpasswordMatch(false); // Used as flag for  message that username/password combo is invalid
      }
      //   else navigate("/main"); // Send user to main page on successful login
    })();

    // Reset 2 fields here, AFTER data passed from client to server
    setUser({ username: "", password: "" });
  }

  return (
    <div>
      <div className="w-screen h-screen flex items-center justify-center gap-20 size=50%">
        <img src={lockImage} alt="lockImg" style={{ width: 30 }} />
      </div>
      <div>Log In</div>
      {/* 2 fields here w/ onSubmit form, tied to LOG IN only */}
      <form onSubmit={submitFormHandler}>
        <label>
          {/* Username: */}
          <input
            type="username"
            name="username"
            placeholder="* Username *"
            value={user.username}
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
            value={user.password}
            onChange={charChangeHandler}
            required
          ></input>
        </label>
        <br></br>
        <button type="submit">LOG IN</button>
        {/* <button onClick={clickTest}>LOG IN</button> */}
      </form>
      <br></br> <br></br>
      <Link to="https://www.google.com/">
        <button>SIGN IN WITH GOOGLE OAUTH</button>
      </Link>
      <br></br> <br></br>
      <Link to="/main">
        <button>CONTINUE AS GUEST</button>
      </Link>
      <br></br> <br></br>
      <div style={{ color: "red" }}>
        {!userANDpasswordMatch
          ? "Username and/or password invalid - PLEASE TRY AGAIN"
          : ""}
      </div>
      <br></br> <br></br>
      <Link to="/signup">Sign up here to create an account</Link>
      <br></br> <br></br>
    </div>
  );
};

export default LogIn;
