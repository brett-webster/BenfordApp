import React from "react";
import { Link } from "react-router-dom";

const MainPageContainer = () => {
  return (
    <>
      <Link to={"/"}>
        <button>GO BACK TO LOGIN</button>
      </Link>
    </>
  );
};

export default MainPageContainer;
