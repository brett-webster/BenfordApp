const express = require("express");
const app = express();
const path = require("path");

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
