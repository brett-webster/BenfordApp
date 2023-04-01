import React, { useState } from "react";
import { render } from "react-dom";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import axios from "axios";
import "./style.css";

// TEST --> should return {connected: "yes"} in browser itself @ "/api/test" endpoint AND in browser console @ "/" endpoint
(async () => {
  const response = await axios.get("/api/test", {
    responseType: "json",
  });
  //   console.log("/api/test: ", response.data);
  //   console.log(response.headers["content-type"]);
})();

// Inputs as an object sent from client to server:  Start date, end date, CIK
// Server returns each as its own variable + randomized 10 digit array of integers 0-9
// ASSEMBLE INPUT HERE AS STARTING POINT -- CURRENTLY DUMMY DATA
// SET UP useContext Provider @ this level so that 3 input data below can be accepted @ lower level (MainContainer), sent to server where processed into outputArr, returned to MainContainer then shared via useContext w/ index.js level so can be accessed here AND below?
// SEE THRESH
const inputBodyObj = {};
inputBodyObj.startDate = "2016-03-03";
inputBodyObj.endDate = "2021-10-27";
inputBodyObj.CIK = "0000913760";
console.log(inputBodyObj);

// Sending input package from client to server-side -- MOVE BELOW TO MainContainer
(async () => {
  const response = await axios.post("/api/input", {
    inputBodyObj,
  });
  console.log("CLIENT-SIDE api/input: ", response.data);
  console.log(response.headers["content-type"]);
})();

// Receiving final processed data back from server-side to client-side -- MOVE BELOW TO MainContainer
(async () => {
  const response = await axios.get("/api/returnData", {
    responseType: "json",
  });
  const outputArr = JSON.parse(response.data).resultArr;
  console.log(
    "CLIENT-SIDE api/returnData: ",
    typeof response.data,
    response.data
  );
  console.log("CLIENT-SIDE api/returnData: ", typeof outputArr, outputArr);
  console.log(response.headers["content-type"]);

  // Moved render() INSIDE of axios get request due to async nature so that outputArr can be passed down as props
  // Also using React 18 version (newer) here, hence different syntax <-- https://www.npmjs.com/package/react-dom / https://github.com/reactwg/react-18/discussions/5
  const root = createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App outputArr={outputArr} />
      </BrowserRouter>
    </React.StrictMode>
  );
})();

// render(
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>,
//     document.getElementById("root")
//   );
