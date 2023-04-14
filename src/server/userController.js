const fs = require("fs");
const path = require("path");
// Cookie parser needs only be present in server.js (parent)

const userController = {};

// --------

userController.isLoggedIn = (req, res, next) => {
  // IF LOGGED IN (i.e. there is cookie), TAKE USER DIRECTLY TO MAIN PAGE IF THEY DIRECTLY KEY IN /signup OR /login ENDPOINTS
  // ** IF LOGGED IN (check for cookie @ beg of "/api/inputAndReturnData" endpoint's middleware), SAVE USERS SEARCH INPUTS & RESULTS to db FOR FUTURE RETRIEVAL
  // ** IN LATER VERSION, ONLY ALLOW ACCESS TO THIS SEARCH HISTORY & RESULTS BASED ON isLoggedIn STATUS (BOTH VIA MOUSECLICK & URL DIRECTLY KEYED IN)
  if (req.cookies.ssid) res.locals.loggedInStatus = true;
  else res.locals.loggedInStatus = false;
  //   console.log("Req cookies: ", req.cookies);
  //   console.log("res.locals.loggedInStatus", res.locals.loggedInStatus);

  // NOTE:  BELOW IS NOT NEEDED as redirects HAPPEN ON CLIENT-SIDE USING navigate("/main");
  // If logged in (as denoted by cookie present on client-side), redirect to MAIN
  // If NOT logged in, proceed to next middleware fxn (i.e. signUp OR logIn)
  //   if (res.locals.loggedInStatus) {
  //     let PORT;
  //     if (process.env.NODE_ENV === "production") PORT = 3000;
  //     else PORT = 8080;
  //     console.log("INSIDE"); // REMOVE
  //     return next({
  //       log: "userController.isLoggedIn:  Middleware redirecting to Main page since user already logged in -- no need to sign up OR log in",
  //       type: "redirect",
  //       url: `http://localhost:${PORT}/api/main`,
  //     });
  //   } else return next();
  return next();
};

// --------

userController.logUserOut = (req, res, next) => {
  // 'Delete' cookie present by resetting to "" so NOT auto-logged back in on redirect
  res.cookie("ssid", "", { httpOnly: true, secure: false });
  //   console.log("Cookies pre-logout: ", req.cookies.ssid);  // NOTE:  resetting res.cookie here will NOT change req.cookies UNTIL next req/res cycle complete
  return next();
};

// --------

userController.signUp = (req, res, next) => {
  const { email, username, password } = req.body.newUser; // destructure req.body object sent from client

  // Saving new user to temporary 'database'
  // Test whether duplicate email or username -- if so, send message back
  // If not duplicate, add to database (cached object w/ username as key & array [email, password] as value)
  // Read from current 'database' file, grabbing state; compare vs. input username (assuming this to be unique ID since need to pick btwn username/email)
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
    // Write new userName into dbObject & save to res.locals
    newdbObject = { ...dbObject, [username]: [email, password, ["CIKs"]] };
    res.locals.newdbObject = newdbObject;

    const newdbObjectString = JSON.stringify(newdbObject);
    fs.writeFileSync(path.resolve(__dirname, "./db.json"), newdbObjectString);

    // Create and save cookie on successful signup
    // const expiresIn = 60 * 60 * 24 * 1 * 1000;  // 1 DAY --> seconds, minutes, hrs, days (ms)
    const expiresIn = 60 * 10 * 1 * 1 * 1000; // 10min
    res.cookie("ssid", username, {
      httpOnly: true,
      secure: false,
      maxAge: expiresIn,
    });
    return next();
  }
};

// --------

userController.logIn = (req, res, next) => {
  const { username, password } = req.body.user; // destructure req.body object sent from client

  // Full path needed here, async not needed
  const dbObjectString = fs.readFileSync(
    path.resolve(__dirname, "./db.json"),
    "utf-8"
  );
  dbObject = JSON.parse(dbObjectString);

  if (dbObject[username] && dbObject[username][1] === password) {
    console.log("VALID login credentials");
    // Create and save cookie on successful login (expires in 1 day)
    // const expiresIn = 60 * 60 * 24 * 1 * 1000;  // 1 DAY --> seconds, minutes, hrs, days (ms)
    const expiresIn = 60 * 10 * 1 * 1 * 1000; // 10min
    res.cookie("ssid", username, {
      httpOnly: true,
      secure: false,
      maxAge: expiresIn,
    });
    return next();
  } else {
    console.log("INVALID Username/Password");
    // Send message back to client -- not truly successful, but needed to convey error back from server-side
    const InvalidCredsMessageForClient = "INVALID Username/Password";
    return res.status(200).json(InvalidCredsMessageForClient);
  }
};

// --------

module.exports = userController;
