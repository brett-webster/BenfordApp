import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage.jsx";
import LogIn from "./components/LogIn.jsx";
import SignUp from "./components/SignUp.jsx";
import MainPageContainer from "./components/MainPageContainer.jsx";

const App = (props) => {
  const { outputArr } = props;

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/main"
          element={<MainPageContainer outputArr={outputArr} />}
        />
      </Routes>
    </>
  );
};

export default App;
