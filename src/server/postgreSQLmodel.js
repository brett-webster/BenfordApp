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

// NOTE:  username_id = Foreign key
// CREATE TABLE searchresults (
//     id SERIAL PRIMARY KEY,
//     cikplusdaterange VARCHAR NOT NULL,
//     user_id INTEGER REFERENCES users (id) NOT NULL,
//     outputobject TEXT NOT NULL
//     );

// ALTER TABLE searchresults RENAME TO pastresults;

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

// --------------

// JOIN TABLE RESULTS (on user id #)

// SELECT pastresults.id AS pastresults_id, users.id AS users_id, username, cikplusdaterange, outputobject, hashedpassword, email FROM pastresults
// LEFT JOIN users ON users.id = user_id
// WHERE users.id = 11;
