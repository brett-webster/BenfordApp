const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const processDataController = require("./processDataController.js");
const userController = require("./userController.js");
const getLessRecentJSONdata = require("./getLessRecentJSONdata.js"); // Pass in parameterized middleware fxn processDataController.createLessRecentURLsAndGrabJSON

app.use(express.json());

const cookieParser = require("cookie-parser"); // Cookie parser required to be present in server.js
app.use(cookieParser());

// -----------

// Below is for production mode only
if (process.env.NODE_ENV === "production") {
  // statically serve everything in the dist folder on the route '/dist', if already built -- this includes pre-built index.html & bundle.js
  // UNDOCUMENT BELOW app.use() LINE TO TEST delivery of pre-built static bundle -- must 'npm run build' first
  app.use(express.static(path.join(__dirname, "../../dist")));
  // serve index.html on the route '/'
  app.get("/", (req, res) => {
    return res
      .status(200)
      .sendFile(path.join(__dirname, "../client/index.html"));
  });
}

// -----------

// SignUp endpoints
app.get("/api/signup", userController.isLoggedIn, (req, res, next) => {
  return res.status(200).json(res.locals.loggedInStatus);
});

app.post(
  "/api/signup",
  userController.signUpCheckDupsAndBcrypt,
  userController.signUpWriteToDBandSetCookie,
  (req, res, next) => {
    return res.status(200).json(res.locals.newdbObject);
  }
);

// Login endpoints
app.get("/api/login", userController.isLoggedIn, (req, res, next) => {
  return res.status(200).json(res.locals.loggedInStatus);
});

app.post(
  "/api/login",
  userController.logInConfirmingBcryptMatchFirst,
  userController.logInFinalStepAndSetCookie,
  (req, res) => {
    return res.status(200).json(req.body.newUser);
  }
);

// Logout endpoint
app.get("/api/logout", userController.logUserOut, (req, res) => {
  return res.status(200).json(req.cookies);
});

// Change password endpoint
app.post(
  "/api/changepassword",
  userController.changepasswordFirstCompareBcrypt,
  userController.changepasswordFinalStepHashNewPassword,
  (req, res, next) => {
    return res.status(200).json(res.locals.newdbObject);
  }
);

// -----------

// Endpoint for client to grab CompanyCIKtickerList for autocomplete
app.get("/api/getCompanyCIKtickerList", (req, res) => {
  // RAW source data --> https://www.sec.gov/files/company_tickers.json
  const companyfilerCIKlistObjFINAL = fs.readFileSync(
    path.resolve(__dirname, "../client/company_cik_and_tickers_FINAL.json")
  );

  // Convert Buffer object into a string before returning response
  return res.status(200).json(String(companyfilerCIKlistObjFINAL));
});

// -----------

// inputAndReturnData endpoint -- Receive input from MainPage component, processes & sends data back to client-side from Node.js
app.post(
  "/api/inputAndReturnData",
  processDataController.importValidFinancialLineItemsObject,
  processDataController.getMostRecentJSONdataAndReturn,
  processDataController.createLessRecentURLsAndGrabJSON(getLessRecentJSONdata), // <--- Parameterizing middleware fxn to accomodate helper fxn
  processDataController.fetchAllURLsInTxtFormat,
  processDataController.iterateThruDOMsOfFinalURLarrAndParse,
  processDataController.compressOutputArrs,
  processDataController.calculateAndDisplayBenfordResults,
  (req, res) => {
    // ONLY need to return outputObject to client, NOT entirety of data accumulated by res.locals object during middleware chain
    const { company, ticker, CIK, startDate, endDate } = req.body.inputObject; // destructure req.body object originally sent from client
    const { outputObject } = res.locals; // destructure

    outputObject.company = company;
    outputObject.ticker = ticker;
    outputObject.CIK = CIK;
    outputObject.startDate = startDate;
    outputObject.endDate = endDate;

    console.log("outputObject:  ", outputObject);
    return res.status(200).json(outputObject);
  }
);

// -----------

//404 handler
app.use((req, res) => res.status(404).json("Page Not Found"));

//Global error handler
app.use((err, req, res, next) => {
  console.log(err);
  const defaultErr = {
    log: "Express error handler caught unknown middleware error",
    status: 500,
    message: { err: "An error occurred" },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  console.log("IN Global Err Handler:  ", errorObj.type, errorObj.url); // REMOVE
  return res.status(errorObj.status).json(errorObj.message);
});

// -----------

// Webpack dev server: front-end html + React bundle --> port 8080 in dev mode
// Express dev server:  provides API data --> port 3000 in dev mode
// Prod mode:  Everything served off of single port 3000 in prod mode
app.listen(3000);
