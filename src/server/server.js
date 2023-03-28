const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());

// -----------

// Below is for production mode only
if (process.env.NODE_ENV === "production") {
  // statically serve everything in the dist folder on the route '/dist', if already built -- this includes pre-built index.html & bundle.js
  // UNDOCUMENT BELOW app.use() LINE TO TEST delivery of pre-built static bundle
  // app.use(express.static(path.join(__dirname, "../../dist")));
  // serve index.html on the route '/'
  app.get("/", (req, res) => {
    return res
      .status(200)
      .sendFile(path.join(__dirname, "../client/index.html"));
  });
}

// TESTING INITIAL INTERCHANGE between CLIENT & SERVER
// const outputResult = JSON.stringify({ connected: "yes" });
const outputResult = { connected: "yes" };
console.log(typeof outputResult);

console.log("SERVER-SIDE: ", outputResult);
// Express server:  provides API data
app.get("/api/test", (req, res) => {
  //   return res.status(200).send("connected YES");
  return res.status(200).json(outputResult);
});

// -----------

//404 handler
app.use((req, res) => res.status(404).json("Page Not Found"));

//Global error handler
app.use((err, req, res, next) => {
  //   console.log(err);
  const defaultErr = {
    log: "Express error handler caught unknown middleware error",
    status: 500,
    message: { err: "An error occurred" },
  };
  if (err.type === "redirect") {
    res.redirect(err.url);
  }
  const errorObj = Object.assign({}, defaultErr, err);
  //   console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

// Webpack dev server: front-end html + React bundle --> port 8080 in dev mode
// Express dev server:  provides API data --> port 3000 in dev mode
// Prod mode:  Everything served off of single port 3000 in prod mode
app.listen(3000);
