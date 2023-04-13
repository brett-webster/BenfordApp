const fs = require("fs");
const path = require("path");

const userController = {};

// --------

userController.isLoggedIn = (req, res, next) => {
  // REVISE THIS
  // IF LOGGED IN (i.e. there is cookie), TAKE USER DIRECTLY TO MAIN PAGE IF THEY DIRECTLY KEY IN /signup OR /login ENDPOINTS
  // IF LOGGED IN, SAVE USERS SEARCH INPUTS & RESULTS to db FOR FUTURE RETRIEVAL
  // IN LATER VERSION, ONLY ALLOW ACCESS TO THIS SEARCH HISTORY & RESULTS BASED ON isLoggedIn STATUS (BOTH VIA MOUSECLICK & URL DIRECTLY KEYED IN)
  //   if (loggedInBoolean) {
  //     let PORT;
  //     if (process.env.NODE_ENV === "production") PORT = 3000;
  //     else port = 8080;

  //     return next({
  //       log: "userController.isLoggedIn:  Middleware redirecting to Main page since user already logged in -- no need to sign up OR log in",
  //       err: { type: "redirect", url: `http://localhost:${PORT}/main` },
  //     });
  //   } else return next();
  return next(); // TEMP
};

// --------

userController.logUserOut = (req, res, next) => {
  // UPDATE THIS BY REMOVING COOKIE - CURRENTLY UNUSED
  // return next(); // TEMP
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
