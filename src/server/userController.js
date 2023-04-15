const fs = require("fs");
const db = require("./postgreSQLmodel.js");
const path = require("path");
const bcrypt = require("bcryptjs");

const userController = {};

// --------

userController.isLoggedIn = (req, res, next) => {
  // IF LOGGED IN (i.e. there is cookie), TAKE USER DIRECTLY TO MAIN PAGE IF THEY DIRECTLY KEY IN /signup OR /login ENDPOINTS
  // ** IF LOGGED IN (check for cookie @ beg of "/api/inputAndReturnData" endpoint's middleware), SAVE USERS SEARCH INPUTS & RESULTS to db FOR FUTURE RETRIEVAL
  // ** IN LATER VERSION, ONLY ALLOW ACCESS TO THIS SEARCH HISTORY & RESULTS BASED ON isLoggedIn STATUS (BOTH VIA MOUSECLICK & URL DIRECTLY KEYED IN)
  if (req.cookies.ssid) res.locals.loggedInStatus = true;
  else res.locals.loggedInStatus = false;
  return next();
};

// --------

userController.logUserOut = (req, res, next) => {
  // 'Delete' cookie present by resetting to "" so NOT auto-logged back in on redirect
  res.cookie("ssid", "", { httpOnly: true, secure: false });
  return next();
};

// --------

userController.signUpCheckDupsAndBcrypt = async (req, res, next) => {
  const { username, password } = req.body.newUser; // destructure req.body object sent from client

  // Test whether duplicate username -- if so, send message back
  // Read from current 'database' file; compare vs. input username (assuming this to be unique ID since need to pick btwn username/email)
  // If not duplicate username, add to database in next middleware fxn (cached object w/ username as key & array [email, password] as value)

  // REMOVE TEMP db CODE BELOW
  //   // Reading in db to dbObject variable
  //   const dbObjectString = fs.readFileSync(
  //     path.resolve(__dirname, "./db.json"),
  //     "utf-8"
  //   );
  //   const dbObject = JSON.parse(dbObjectString);
  //   res.locals.dbObject = dbObject;

  // Query (READ) whether username present in SQL db
  const findUserQuery = `
    SELECT * FROM users
    WHERE username = $1;
  `;
  const values = [username];
  const usernameResultFromDB = await db.query(findUserQuery, values);
  console.log("User found (signup):  ", usernameResultFromDB.rows[0]);

  if (usernameResultFromDB.rows[0]) {
    // Dup username, return error
    console.log(
      "Username dup, end middleware chain here & send message back to client"
    );
    // Send message back to client -- not truly successful, but needed to convey error back from server-side
    return res.status(200).json("DUPLICATE Username");
  } else {
    // If valid signup, apply bcrypt hashing to password & save result to res.locals
    try {
      const SALT_WORK_FACTOR = 10;
      const hashedPassword = await bcrypt.hash(password, SALT_WORK_FACTOR);
      res.locals.hashedPassword = hashedPassword;
      console.log("HashedPass: ", hashedPassword);
      return next();
    } catch (err) {
      return next({
        log: "userController.signUpCheckDupsAndBcrypt:  Middleware error occurred in bcrypt hashing process during signup",
        message: {
          err: `userController.signUpCheckDupsAndBcrypt: ${err}`,
        },
      });
    }
  }
};

// --------

userController.signUpWriteToDBandSetCookie = async (req, res, next) => {
  const { email, username } = req.body.newUser; // destructure req.body object sent from client
  const { hashedPassword } = res.locals;

  try {
    console.log(
      "Not a dup; save new user data to DB & proceed to next middleware"
    );
    // REMOVE TEMP db CODE BELOW
    // // Write new userName into dbObject
    // const newdbObject = {
    //   ...dbObject,
    //   [username]: [email, password, hashedPassword, ["CIKs"]],
    // };

    // const newdbObjectString = JSON.stringify(newdbObject);
    // fs.writeFileSync(path.resolve(__dirname, "./db.json"), newdbObjectString);

    console.log("User info to INSERT:  ", username, hashedPassword, email);

    // Add (CREATE) newly signed up user into SQL db
    const createUserQuery = `
        INSERT INTO users
        (username, hashedpassword, email)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [username, hashedPassword, email];
    const createUserQueryResults = await db.query(createUserQuery, values);
    console.log("NEW user created (signup):  ", createUserQueryResults.rows[0]);

    // Create and save cookie on successful signup
    // const expiresIn = 60 * 60 * 24 * 1 * 1000;  // 1 DAY --> seconds, minutes, hrs, days (ms)
    const expiresIn = 60 * 10 * 1 * 1 * 1000; // 10min
    res.cookie("ssid", username, {
      httpOnly: true,
      secure: false,
      maxAge: expiresIn,
    });
    return next();
  } catch (err) {
    return next({
      log: "userController.signUpWriteToDBandSetCookie:  Middleware error occurred writing new user info to database and/or setting cookie",
      message: {
        err: `userController.signUpWriteToDBandSetCookie: ${err}`,
      },
    });
  }
};

// --------

userController.logInConfirmingBcryptMatchFirst = async (req, res, next) => {
  const { username, password } = req.body.user; // destructure req.body object sent from client

  // REMOVE TEMP db CODE BELOW
  //   // Full path needed here, async not needed
  //   const dbObjectString = fs.readFileSync(
  //     path.resolve(__dirname, "./db.json"),
  //     "utf-8"
  //   );
  //   const dbObject = JSON.parse(dbObjectString);
  //   res.locals.dbObject = dbObject;

  // Query (READ) whether username present in SQL db
  const findUserQuery = `
    SELECT * FROM users
    WHERE username = $1;
  `;
  const values = [username];
  const usernameResultFromDB = await db.query(findUserQuery, values);
  console.log("User found (login):  ", usernameResultFromDB.rows[0]);

  // Below logic assumes all usernames possess a hashed password
  if (usernameResultFromDB.rows[0]) {
    // Compare untouched password input by user for login vs. bcrypt-decrypted password from db, returning boolean = true if match
    const hashedPasswordMatch = await bcrypt.compare(
      password,
      usernameResultFromDB.rows[0].hashedpassword
    );
    console.log(
      "Bcrypt-hashed results of user input match DB?  ",
      hashedPasswordMatch
    );
    res.locals.hashedPasswordMatch = hashedPasswordMatch;
    return next();
  } else {
    console.log("INVALID Username");
    // Send message back to client -- not truly successful, but needed to convey error back from server-side
    return res.status(200).json("INVALID Username");
  }
};

// --------

userController.logInFinalStepAndSetCookie = (req, res, next) => {
  const { username } = req.body.user; // destructure req.body object sent from client
  const { hashedPasswordMatch } = res.locals;

  // Check whether input password matches hashed password in db (previously confirmed username IS found)
  if (hashedPasswordMatch) {
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
    console.log("INVALID Password");
    // Send message back to client -- not truly successful, but needed to convey error back from server-side
    return res.status(200).json("INVALID Password");
  }
};

// --------

userController.changepasswordFirstCompareBcrypt = async (req, res, next) => {
  const { username, currentPassword } = req.body.currentUser; // destructure req.body object sent from client

  // REMOVE TEMP db CODE BELOW
  //   // Full path needed here, async not needed
  //   const dbObjectString = fs.readFileSync(
  //     path.resolve(__dirname, "./db.json"),
  //     "utf-8"
  //   );
  //   const dbObject = JSON.parse(dbObjectString);
  //   res.locals.dbObject = dbObject;

  // Query (READ) whether username present in SQL db
  const findUserQuery = `
    SELECT * FROM users
    WHERE username = $1;
  `;
  const values = [username];
  const usernameResultFromDB = await db.query(findUserQuery, values);
  console.log(
    "Username found (changepassword):  ",
    usernameResultFromDB.rows[0]
  );

  // Below logic assumes all usernames possess a hashed password
  if (usernameResultFromDB.rows[0]) {
    // Compare untouched password input by user for login vs. bcrypt-decrypted password from db, returning boolean = true if match
    const hashedPasswordMatch = await bcrypt.compare(
      currentPassword,
      usernameResultFromDB.rows[0].hashedpassword
    );
    console.log(
      "Bcrypt-hashed results of user input (password change) match DB?  ",
      hashedPasswordMatch
    );
    res.locals.hashedPasswordMatch = hashedPasswordMatch;
    res.locals.email = usernameResultFromDB.rows[0].email;
    return next();
  } else {
    console.log("INVALID Username");
    // Send message back to client -- not truly successful, but needed to convey error back from server-side
    return res.status(200).json("INVALID Username");
  }
};

// --------

userController.changepasswordFinalStepHashNewPassword = async (
  req,
  res,
  next
) => {
  const { username, newPassword } = req.body.currentUser; // destructure req.body object sent from client
  const { hashedPasswordMatch, email } = res.locals;

  // If current password input matches decrypted password in db (AND username + matching new passwords are kosher as validated in prior steps), apply bcrypt hashing to new password & update db w/ it
  if (hashedPasswordMatch) {
    const SALT_WORK_FACTOR = 10;
    const hashedPassword = await bcrypt.hash(newPassword, SALT_WORK_FACTOR);
    console.log(
      "HashedPass (updated password): ",
      newPassword,
      " <==> ",
      hashedPassword
    );

    // Query to UPDATE user password in SQL db
    const updateUserPasswordQuery = `
        UPDATE users
        SET hashedpassword = $2
        WHERE username = $1
        RETURNING *;
    `;
    const values = [username, hashedPassword];
    // const updateUserPasswordResultsFromDB = await db.query(
    const { rows } = await db.query(updateUserPasswordQuery, values);
    console.log(
      "Password update final status (changepassword):  ",
      //   updateUserPasswordResultsFromDB.rows[0]
      rows[0]
    );

    res.locals.newdbObject = {
      [username]: [username, newPassword, hashedPassword, email],
    };
    console.log("res.locals.newdbObject:  ", res.locals.newdbObject);

    // REMOVE TEMP db CODE BELOW
    // const email = dbObject[username][0];
    // // Write updated user data into dbObject
    // const newdbObject = {
    //   ...dbObject,
    //   [username]: [email, newPassword, hashedPassword, ["CIKs"]],
    // };
    // res.locals.newdbObject = newdbObject;
    // const newdbObjectString = JSON.stringify(newdbObject);
    // fs.writeFileSync(path.resolve(__dirname, "./db.json"), newdbObjectString);

    return next();
  } else {
    console.log("INVALID Current Password");
    // Send message back to client -- not truly successful, but needed to convey error back from server-side
    return res.status(200).json("INVALID Current Password");
  }
};

// --------

module.exports = userController;
