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
  console.log(response.data);
  console.log(response.headers["content-type"]);
})();

// render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>,
//   document.getElementById("root")
// );
