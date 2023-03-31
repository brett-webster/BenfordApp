const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

// Node.js equivalent of localStorage on client-side (attached to window)
const LocalStorage = require("node-localstorage").LocalStorage;
const localStorage = new LocalStorage("./node-localStorage");

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

// TESTING INITIAL INTERCHANGE between CLIENT & SERVER
const outputResult = { connected: "yes" };
// console.log(typeof outputResult);
// console.log("SERVER-SIDE: ", outputResult);
// Express server:  provides API data
app.get("/api/test", (req, res) => {
  //   return res.status(200).send("connected YES");
  return res.status(200).json(outputResult);
});

// Receive input from client-side, process data, store in Node.js localStorage & print to terminal
app.post("/api/input", (req, res) => {
  console.log("SERVER-SIDE /api/input: ", req.body);
  req.body.inputBodyObj.CIK = "ZZZZ"; // ADD leading 0s to CIK, if needed
  const arr = []; // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < 10; i++) {
    arr.push(Math.floor(Math.random() * 10000));
  }
  req.body.inputBodyObj.resultArr = arr;
  console.log("UPDATED req.body: ", req.body);
  localStorage.setItem("processedData", JSON.stringify(req.body.inputBodyObj));
  return res.status(200).json(req.body);
});

// Send processed data back to client-side from Node.js localStorage for presentation
app.get("/api/returnData", (req, res) => {
  const returnData = localStorage.getItem("processedData");
  return res.status(200).json(returnData);
});

// -----------

// MOVE below to controllers w/ middleware once ready
// SignUp endpoint
app.post("/api/signup", (req, res, next) => {
  req.body.alpha = "beta";
  console.log("NEWUSER req.body on Server-side: ", req.body);
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

  // TEST
  console.log(
    typeof dbObject,
    dbObject,
    dbObject["abc"],
    typeof dbObject["max"],
    dbObject["max"],
    dbObject["brett"],
    username,
    dbObject[username]
  );

  let newdbObject;
  if (dbObject[username]) {
    console.log(
      "Username dup, end middleware chain here & send message back to client"
    );
    // Send message back to client -- not truly successful, but needed to convey error back from server-side
    const duplicateUserNameMessageForClient = "DUPLICATE USERNAME";
    return res.status(200).json(duplicateUserNameMessageForClient);
    // Return error here & end middleware chain
    // return next({
    //   status: 400,
    //   log: "Error in userController.signUp -- userName dup NOT allowed",
    //   message: {
    //     err: "Error in userController.signUp -- userName dup NOT allowed",
    //   },
    // });
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
  //   return res.status(200).json(req.body);
});

// Login endpoint
app.post("/api/login", (req, res) => {
  req.body.gamma = "G";
  console.log("CURRENTUSER req.body on Server-side: ", req.body);
  const { username, password } = req.body.user; // destructure req.body object sent from client

  // Full path needed here, async not needed
  const dbObjectString = fs.readFileSync(
    path.resolve(__dirname, "./db.json"),
    "utf-8"
  );
  dbObject = JSON.parse(dbObjectString);
  //   console.log(typeof dbObject, dbObject);

  console.log(
    "TEST: ",
    username,
    dbObject[username],
    password
    // dbObject[username][1]  // throws error if username non-existent
  );
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
