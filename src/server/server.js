const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const getDataFromSECedgarJSONandProcess = require("./getDataFromSECedgarJSONandProcess");

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

// MOVE below items to controllers w/ middleware, once ready
// /inputdata endpoint -- Receive input from MainPage component, processes & sends data back to client-side from Node.js
app.post("/api/inputAndReturnData", (req, res) => {
  // console.log("INPUT DATA req.body on Server-side: ", req.body);
  const { company, ticker, CIK, startDate, endDate } = req.body.inputObject; // destructure req.body object sent from client

  // Add leading digits to CIK code, if length is less than 10 to standardize
  let fullCIK = CIK;
  while (fullCIK.length < 10) {
    fullCIK = "0" + fullCIK;
  }

  // TEMPORARY PLACEHOLDER UNTIL BACKEND ANALYSIS IS COMPLETE
  // BACKEND ANALYSIS TO BE PART OF THIS MIDDLEWARE CHAIN using res.locals, ultimately returning an updated processedObj attached to res.locals
  // "getJSON" "confirmValidData" (return msg w. emptyDataBoolean on res.locals IF sum of array entries === 0) "processData"
  // ONCE res.locals.outputObject IS RETURNED BACK TO FRONT END, RESET object key to EMPTY STRINGS to avoid grabbing stale data on future server pings...
  const arr = []; // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < 10; i++) {
    arr.push(Math.floor(Math.random() * 10000));
  }

  // Promise chaining
  // getDataFromSECedgarJSONandProcess(CIK, startDate, endDate).then(
  //   (processedObj) => {
  //     console.log("processedObj MAIN: ", processedObj);
  //     // const { quarters } = processedObj.quarters;
  //   }
  // );
  // ALTERNATE FORM
  (async () => {
    const processedObj = await getDataFromSECedgarJSONandProcess(
      CIK,
      startDate,
      endDate
    );
  })();

  res.locals.outputObject = req.body.inputObject;
  // ** INCLUDE LOGIC HERE TO DETERMINE RESULT OF EACH OF THE BELOW TO PASS BACK **
  res.locals.outputObject.company = company;
  res.locals.outputObject.ticker = ticker;
  res.locals.outputObject.CIK = fullCIK;
  res.locals.outputObject.startDate = startDate;
  res.locals.outputObject.endDate = endDate;
  // res.locals.outputObject.quarters = quarters;
  res.locals.outputObject.resultArr = arr;
  res.locals.outputObject.maxKSdifference = 0.567;
  res.locals.outputObject.leadingDigit = 7;
  res.locals.outputObject.totalDigitCount = 340;
  res.locals.outputObject.sumOfLeadingDigitCount = 81;
  res.locals.outputObject.results5pcCritical = "REJECT"; // OR 'FAIL TO REJECT'
  res.locals.outputObject.results1pcCritical = "FAIL TO REJECT"; // OR 'FAIL TO REJECT'
  console.log("res.locals.outputObject: ", res.locals.outputObject);

  return res.status(200).json(res.locals.outputObject);
});

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
  // BELOW MERELY TESTS -- TO REMOVE
  // console.log(
  //   JSON.parse(companyfilerCIKlistObjFINAL),
  //   typeof companyfilerCIKlistObjFINAL, // <--- yields type Buffer (object NOT string) w/o JSON.parse()
  //   "Babcock & Wilcox Enterprises, Inc. ",
  //   JSON.parse(companyfilerCIKlistObjFINAL)[
  //     "Babcock & Wilcox Enterprises, Inc.".toUpperCase()
  //   ]
  // );
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
