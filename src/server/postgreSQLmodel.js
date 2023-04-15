const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const PG_URI = process.env.PG_URI;
const PASS = process.env.PASS;

// console.log(process.env);
// console.log("PG: ", PG_URI, PASS);

const pool = new Pool({
  connectionString: PG_URI,
});

// console.log("Pool details: ", pool);

// --------------

// NOTE:  Using async/await for queries (omitting callback param below)
module.exports = {
  query: (text, params) => {
    console.log("Query executed:  ", text);
    return pool.query(text, params);
  },
};

// --------------

// NOTES
//
// https://www.elephantsql.com/  (SSO via Github)

// DB password:  ...
// Full URI:  ...
// API Key:  ...

// psql -d [FULL URI]  <---- ENTER THIS IN CLI TO RUN SQL COMMANDS THERE

// --------------

// TABLE CREATION

// SCHEMA --->

// CREATE TABLE users (
//     id SERIAL PRIMARY KEY,
//     username VARCHAR NOT NULL UNIQUE,
//     hashedpassword VARCHAR NOT NULL,
//     email VARCHAR NOT NULL
//     );

// DROP TABLE <tablename>

// --------------

// CRUD (for CLI & ElephantSQL; JS syntax slightly different)

// ** INSERT (CREATE) **
// INSERT INTO users
// (username, hashedpassword, email)
// VALUES ('fred', 'fred', 'Fred.com');

// ** SELECT (READ) **
// SELECT * FROM users
// WHERE username='fred';   // <-- single quotes

// ** UPDATE (UPDATE) **
// UPDATE users
// SET hashedpassword='tom', email='Tom.com'
// WHERE username='fred';

// ** DELETE (DELETE) **
// DELETE FROM users <-- deletes ALL rows (but NOT table itself)
// DELETE FROM users WHERE username='fred;  // single
// DELETE FROM users WHERE email IN ('Tom.com', 'Fred.com');  // multiple
