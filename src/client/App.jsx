import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage.jsx";
import LogIn from "./components/LogIn.jsx";
import SignUp from "./components/SignUp.jsx";
import MainPage from "./components/MainPage.jsx";

const App = (props) => {
  const { outputArr } = props;

  return (
    <>
      <Routes>
        <Route exact path="/" element={<LandingPage />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/main" element={<MainPage outputArr={outputArr} />} />
      </Routes>
    </>
  );
};

export default App;
