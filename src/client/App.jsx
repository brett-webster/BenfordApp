import React from "react";
import { Route, Routes } from "react-router-dom";
import LogInPageContainer from "./components/LogInPageContainer.jsx";
import MainPageContainer from "./components/MainPageContainer.jsx";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LogInPageContainer />} />
        <Route path="/main" element={<MainPageContainer />} />
      </Routes>
    </>
  );
};

export default App;
