import React, { useState, createContext } from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage.jsx";
import LogIn from "./components/LogIn.jsx";
import SignUp from "./components/SignUp.jsx";
import MainPage from "./components/MainPage.jsx";

export const chartDisplayContext = createContext("contextAPI!"); // Added for useContext hook, export required

const App = () => {
  const [chartDisplayBoolean, setChartDisplayBoolean] = useState(false);

  return (
    <>
      {/* Passing down certain props, including setState method used in tandem w/ useContext */}
      {/* Provider WRAPPERs ADDED below for useContext hooks, need to use "value" prop in syntax below -- setting state @ lower component but need access to result @ higher level or sibling component */}
      <chartDisplayContext.Provider value={chartDisplayBoolean}>
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/main"
            element={
              <MainPage setChartDisplayBoolean={setChartDisplayBoolean} />
            }
          />
        </Routes>
      </chartDisplayContext.Provider>
    </>
  );
};

export default App;
