const fs = require("fs");

// NOTE:  CAN copy/paste THE BELOW into server.js to generate/clean updated raw source data
// NOTE: depending on the location of the code, may need to modify paths under path.resolve(__dirname..)
// CONSIDER PULLING OUT CALLBACK AS SEPARATE FXN SO IT IS MORE EASILY READABLE..
// Below code grabs data (company/CIK/ticker) from .json file that's been pulled/modified from SEC link below to create streamlined hash table for future O(1) look-up speed
// Includes company names (key) and CIK codes / ticker symbols (array of values [2])
// NOTE:  There are some duplicate names; though they all seem to have the same CIK code but differing tickers; code always grabs the element that is closest to the end of the object (i.e. most recent ticker change)
// RAW source data --> https://www.sec.gov/files/company_tickers.json

fs.readFile(
  path.resolve(__dirname, "../client/company_cik_and_tickers_RAW.json"),
  (err, companyfilerCIKlist) => {
    if (err) console.log(`ERROR in processing ${err}`); // MODIFY THIS TO FLOW TO ERROR HANLDER

    const companyfilerCIKlistObjRaw = JSON.parse(companyfilerCIKlist); // convert JSON string to object
    console.log(
      "companyfilerCIKlist length: ",
      // companyfilerCIKlistObjRaw,
      Object.keys(companyfilerCIKlistObjRaw).length,
      typeof companyfilerCIKlist // type = object
    );

    // Iterate through raw object, adding leading 0s for CIKs and re-creating new object w/ company names as keys
    const companyfilerCIKlistObj = {};
    for (const companyNum in companyfilerCIKlistObjRaw) {
      // Add leading digits to CIK code, if length is less than 10 to standardize
      let fullCIK = companyfilerCIKlistObjRaw[companyNum]["cik_str"].toString();
      while (fullCIK.length < 10) {
        fullCIK = "0" + fullCIK;
      }

      companyfilerCIKlistObj[
        companyfilerCIKlistObjRaw[companyNum]["title"].toUpperCase()
      ] = [fullCIK, companyfilerCIKlistObjRaw[companyNum]["ticker"]];
      // console.log(companyfilerCIKlistObjRaw[company]["cik_str"]);
      // console.log(companyfilerCIKlistObjRaw[company]["ticker"]);
    }
    // console.log(
    //   companyfilerCIKlistObj,
    //   Object.keys(companyfilerCIKlistObj).length
    // );

    // Write new object to local file that will be used in BenfordApp codebase for input
    fs.writeFileSync(
      path.resolve(__dirname, "../client/company_cik_and_tickers_FINAL.json"),
      JSON.stringify(companyfilerCIKlistObj)
    );

    // TEST:  Read unique companies from just written file into variable companyfilerCIKlistObjFINAL
    const companyfilerCIKlistObjFINAL = fs.readFileSync(
      path.resolve(__dirname, "../client/company_cik_and_tickers_FINAL.json")
    );
    console.log(
      "Babcock & Wilcox Enterprises, Inc. ",
      JSON.parse(companyfilerCIKlistObjFINAL)[
        "Babcock & Wilcox Enterprises, Inc.".toUpperCase()
      ]
    );
    // console.log(Object.keys(JSON.parse(companyfilerCIKlistObjFINAL)).length);

    // EVENTUALLY MOVE BELOW INTO ACTUAL CODE - ** BELOW ARRAY IS CREATED AND USED FOR AUTOCOMPLETE **
    // Iterate thru newly created object to create array -- object eliminated dups, sorted array of company names needed for auto-complete code
    const companyfilerCIKlistArr = [];
    for (const companyName in companyfilerCIKlistObj) {
      companyfilerCIKlistArr.push(companyName);
    }
    // console.log(companyfilerCIKlistObj);
    // companyfilerCIKlistArr.sort();
    // console.log(companyfilerCIKlistArr.length);
  }
);

// EXPORT MISSING INTENTIONALLY
