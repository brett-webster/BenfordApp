const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const processDataController = require("./processDataController.js");
const getLessRecentJSONdata = require("./getLessRecentJSONdata.js"); // ADDED 4/12 to pass into parameterized middleware fxn processDataController.createLessRecentURLsAndGrabJSON

app.use(express.json());

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

// MOVE below to controllers w/ middleware once ready
// SignUp endpoint
app.post("/api/signup", (req, res, next) => {
  const { email, username, password } = req.body.newUser; // destructure req.body object sent from client

  // Saving new user to temporary 'database' -- modularize this once functional
  // Test whether duplicate email or username -- if so, send message back
  // If not duplicate, add to database (cached object w/ username as key & array [email, password] as value)
  // Read from current 'database' file, grabbing state; compare vs. input username (assuming this to be unique ID since need to pick btwn username/email)
  // Full path needed here, async not needed
  const dbObjectString = fs.readFileSync(
    path.resolve(__dirname, "./db.json"),
    "utf-8"
  );
  dbObject = JSON.parse(dbObjectString);

  let newdbObject;
  if (dbObject[username]) {
    console.log(
      "Username dup, end middleware chain here & send message back to client"
    );
    // Send message back to client -- not truly successful, but needed to convey error back from server-side
    const duplicateUserNameMessageForClient = "DUPLICATE USERNAME";
    return res.status(200).json(duplicateUserNameMessageForClient);
  } else {
    console.log(
      "Not a dup; save new user data to DB & proceed to next middleware"
    );
    // Write new userName into dbObject
    newdbObject = { ...dbObject, [username]: [email, password, ["CIKs"]] };
    const newdbObjectString = JSON.stringify(newdbObject);
    fs.writeFileSync(path.resolve(__dirname, "./db.json"), newdbObjectString);
    // Allow user to go to next middleware which processes Benford data
    // Ultimately return successful 200 status below
  }
  return res.status(200).json(newdbObject);
});

// Login endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body.user; // destructure req.body object sent from client

  // Full path needed here, async not needed
  const dbObjectString = fs.readFileSync(
    path.resolve(__dirname, "./db.json"),
    "utf-8"
  );
  dbObject = JSON.parse(dbObjectString);

  if (dbObject[username] && dbObject[username][1] === password) {
    console.log("VALID login credentials");
    // Allow user to go to next middleware which processes Benford data
    // Ultimately return successful 200 status below
  } else {
    console.log("INVALID Username/Password");
    // Send message back to client -- not truly successful, but needed to convey error back from server-side
    const InvalidCredsMessageForClient = "INVALID Username/Password";
    return res.status(200).json(InvalidCredsMessageForClient);
  }
  return res.status(200).json(req.body);
});

// -----------

// Endpoint for client to grab CompanyCIKtickerList for autocomplete
app.get("/api/getCompanyCIKtickerList", (req, res) => {
  // RAW source data --> https://www.sec.gov/files/company_tickers.json
  const companyfilerCIKlistObjFINAL = fs.readFileSync(
    path.resolve(__dirname, "../client/company_cik_and_tickers_FINAL.json")
  );

  // Need to convert Buffer object into a string before returning response, otherwise can't easily work w/ data type on client side
  return res.status(200).json(String(companyfilerCIKlistObjFINAL));
});

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
  if (err.type === "redirect") {
    res.redirect(err.url);
  }
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

// Webpack dev server: front-end html + React bundle --> port 8080 in dev mode
// Express dev server:  provides API data --> port 3000 in dev mode
// Prod mode:  Everything served off of single port 3000 in prod mode
app.listen(3000);
