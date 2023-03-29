import React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import axios from "axios";

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
const inputBodyObj = {};
inputBodyObj.startDate = "2016-03-03";
inputBodyObj.endDate = "2021-10-27";
inputBodyObj.CIK = "0000913760";
console.log(inputBodyObj);

// Sending input package from client to server-side
(async () => {
  const response = await axios.post("/api/input", {
    inputBodyObj,
  });
  console.log("CLIENT-SIDE api/input: ", response.data);
  console.log(response.headers["content-type"]);
})();

// Receiving final processed data back from server-side to client-side
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
  //   chartBenfordResults(outputArr); // Import this from another module
})();

// render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>,
//   document.getElementById("root")
// );
