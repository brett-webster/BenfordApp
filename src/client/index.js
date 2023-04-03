import React from "react";
import { render } from "react-dom";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./style.css";

// Also using React 18 version (newer) here, hence different syntax <-- https://www.npmjs.com/package/react-dom / https://github.com/reactwg/react-18/discussions/5
const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
