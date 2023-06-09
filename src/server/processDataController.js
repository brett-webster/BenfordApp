const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const db = require("./postgreSQLmodel.js");

// Node.js equivalent of localStorage on client-side (attached to window)
const LocalStorage = require("node-localstorage").LocalStorage;
const localStorage = new LocalStorage("./node-localStorage");

const processDataController = {};

// --------

// Initialize validFinancialLineItemsObject object containing all Benford-eligible financial line items by importing from below .txt file.
// Omit line items that are NOT applicable OR are derivatives of other line items (e.g. Net Income derives from Revenue & Expenses, and is therefore omitted from the master list)
processDataController.importValidFinancialLineItemsObject = (
  req,
  res,
  next
) => {
  try {
    console.log("Confirmation that data is currently being processed...");
    console.log("...timer has started (see 'default:' in CLI)...");
    let timeLabel;
    console.time(timeLabel);

    // localStorage.removeItem("validFinancialLineItemsObject");
    // Using node-localStorage to avoid repeated read-ins of .txt file from server
    let lineItemsObject = JSON.parse(
      localStorage.getItem("validFinancialLineItemsObject")
    );

    // Only read in from file if NOT already present in node-storage
    if (lineItemsObject === null) {
      console.log(
        "Node pinging server for validFinancialLineItems.txt, NOT in node localStorage..."
      );
      const contents = fs.readFileSync(
        path.resolve(__dirname, "./validFinancialLineItems.txt")
      );

      let validFinancialLineItemsArr = contents.toString().split(/\r?\n/); // NOTE:  Can add "utf-8" w/in fs.readFileSync IN PLACE of .toString()

      // Convert validFinancialLineItems from array into object
      lineItemsObject = validFinancialLineItemsArr.reduce(
        (combined, currentValue) => ({
          ...combined,
          [currentValue]: currentValue,
        }),
        {}
      );
      localStorage.setItem(
        "validFinancialLineItemsObject",
        JSON.stringify(lineItemsObject)
      );
    }

    res.locals.lineItemsObject = lineItemsObject; // Assign to res.locals
    res.locals.timeLabel = timeLabel;
    return next();
  } catch (err) {
    return next({
      log: "processDataController.importValidFinancialLineItemsObject:  Middleware error occurred reading in valid financial line items from .txt file used in DOM parsing analysis of each financial statement",
      message: {
        err: `processDataController.importValidFinancialLineItemsObject: ${err}`,
      },
    });
  }
};

// --------

// Prior to pinging SEC's JSON API/JSDOM parsing, first check SQL db table for identical search parameters & associated results
// If found, assign full bundle of results to res.locals (applying conditional to this variable thru rest of middleware chain to skip the expensive/unnecessary steps)
processDataController.firstCheckDBforDupPastResults = async (
  req,
  res,
  next
) => {
  try {
    let outputObject = ""; // Initially assign to empty string for ease of testing in conditional

    // Search db table 'pastresults' for prior matching results (cached to avoid re-processing)
    const { company, ticker, CIK, startDate, endDate } = req.body.inputObject; // destructure req.body object originally sent from client
    const cikPlusDateRangeInput = CIK + startDate + endDate;
    console.log(
      "cikPlusDateRangeInput: ",
      cikPlusDateRangeInput,
      typeof cikPlusDateRangeInput,
      cikPlusDateRangeInput
    );
    const findPriorMatchingSearchQuery = `
            SELECT * FROM pastresults
            WHERE cikplusdaterange = $1;
        `;
    const values = [cikPlusDateRangeInput];
    const { rows } = await db.query(findPriorMatchingSearchQuery, values);
    console.log("Matching results found:  ", rows[0], rows[0] === undefined); // undefined if no match
    if (rows[0] !== undefined) outputObject = JSON.parse(rows[0].outputobject);
    console.log(
      "outputObject IN firstCheckDBforDupPastResults:  ",
      typeof outputObject,
      outputObject
    );

    res.locals.outputObject = outputObject; // Assign to res.locals (empty string or full object), to be destructured & eventually sent back to client upon successful completion of middleware chain
    return next();
  } catch (err) {
    return next({
      log: "processDataController.firstCheckDBforDupPastResults:  Middleware error occurred checking db table 'pastresults' for exact match of current user input",
      message: {
        err: `processDataController.firstCheckDBforDupPastResults: ${err}`,
      },
    });
  }
};

// --------

// Use node-fetch API to grab the full SEC EDGAR JSON object & extract/save the most recent financial statement URLs - part 1 of fin statement URL array assembly
processDataController.getMostRecentJSONdataAndReturn = async (
  req,
  res,
  next
) => {
  try {
    const { outputObject } = res.locals;

    if (typeof outputObject === "object")
      return next(); // If outputObject has already been populated (i.e. no longer type 'string'), no need to do extra work, skip to next middleware fxn & all the way thru end of chain..
    else {
      // Add leading digits to CIK code, if length is less than 10 to standardize -- IS THIS NEEDED IF ALREADY DONE ON FRONT-END?
      let fullCIK = req.body.inputObject.CIK;
      while (fullCIK.length < 10) {
        fullCIK = "0" + fullCIK;
      }

      // Construct company-specific source URL containing JSON data; this object will be parsed in order to target & extract all relevant financial statement URLs for the specific company within the given time frame
      const urlWithJSON =
        "https://data.sec.gov/submissions/CIK" + fullCIK + ".json";

      const response = await fetch(urlWithJSON, {
        method: "GET",
        // body: JSON.stringify(body),
        headers: {
          // 'Content-Type': 'application/json',
          //  INSTRUCTIONS for SETTING user-agent REQUEST HEADER:  https://www.sec.gov/os/accessing-edgar-data
          "User-Agent": "Brett Webster websterbrett@gmail.com",
          "Accept-Encoding": "gzip, deflate",
        },
      });
      const mainJSONObj = await response.json();

      const cik = mainJSONObj.cik;
      const formArr = mainJSONObj.filings.recent.form;
      const reportDateArr = mainJSONObj.filings.recent.reportDate;
      const accessionNumberArr = mainJSONObj.filings.recent.accessionNumber;
      const primaryDocumentArr = mainJSONObj.filings.recent.primaryDocument;
      const { startDate, endDate } = req.body.inputObject; // destructure req.body object sent from client
      const arrOfassembledURLs = [];

      // Assemble each valid financial statement URL from component parts & then append onto aggregate array of valid financial statement URLs
      for (let i = 0; i < accessionNumberArr.length; i++) {
        if (
          (formArr[i] === "10-K" ||
            formArr[i] === "10-Q" ||
            formArr[i] === "20-F" || // NOTE:  These last 2 are for foreign issuers
            formArr[i] === "40-F") &&
          reportDateArr[i] >= startDate &&
          reportDateArr[i] <= endDate
        ) {
          const assembledURLhtm =
            "https://www.sec.gov/Archives/edgar/data/" +
            cik +
            "/" +
            accessionNumberArr[i].replace(/-/g, "") +
            "/" +
            primaryDocumentArr[i];
          arrOfassembledURLs.push(assembledURLhtm);
        }
      }

      res.locals.mainJSONObj = mainJSONObj; // Assign to res.locals
      res.locals.arrOfassembledURLs = arrOfassembledURLs;
      res.locals.fullCIK = fullCIK;
      return next();
    }
  } catch (err) {
    return next({
      log: "processDataController.getMostRecentJSONdataAndReturn:  Middleware error occurred attempting to extract the company's most recent financial statement URLs, fetching fetching urlWithJSON",
      message: {
        err: `processDataController.getMostRecentJSONdataAndReturn: ${err}`,
      },
    });
  }
};

// --------

// Use node-fetch API again to grab "appendix" objects w/in the company's same full SEC EDGAR JSON object containing LESS recent financial data, within the prescribed data range
// Extract/save all additional financial statement URLs - part 2 of fin statement URL array assembly
// Uses helper function getLessRecentJSONdata.js (not part of middleware chain) during looping
processDataController.createLessRecentURLsAndGrabJSON = (
  getLessRecentJSONdata // <--- Parameterizing middleware fxn to accomodate helper fxn getLessRecentJSONdata
) => {
  return async (req, res, next) => {
    try {
      let { outputObject, mainJSONObj, arrOfassembledURLs, fullCIK } =
        res.locals;
      const { startDate, endDate } = req.body.inputObject;

      if (typeof outputObject === "object")
        return next(); // If outputObject has already been populated (i.e. no longer type 'string'), no need to do extra work, skip to next middleware fxn & all the way thru end of chain..
      else {
        // Adjust data range to grab slightly more data than is required & squarely matches SEC submission data (i.e. 2 additional submission files where user-inputted start and end dates fall within the submission range) -- dates outside user-input range will be subsequently filtered out
        let startDateforExpandedRange = startDate; // Set defaults in case way out of range
        let endDateforExpandedRange = endDate;
        for (let i = 0; i < mainJSONObj.filings.files.length; i++) {
          if (
            startDate >= mainJSONObj.filings.files[i].filingFrom &&
            startDate <= mainJSONObj.filings.files[i].filingTo
          ) {
            startDateforExpandedRange = mainJSONObj.filings.files[i].filingFrom;
          }
          if (
            endDate >= mainJSONObj.filings.files[i].filingFrom &&
            endDate <= mainJSONObj.filings.files[i].filingTo
          ) {
            endDateforExpandedRange = mainJSONObj.filings.files[i].filingTo;
          }
        }

        // Extract JSON links going back MORE THAN 1,000 entries into a separate array, iterate through this array to add additional, valid historic URLs onto aggregate array
        const promisesArr = [];
        for (let i = 0; i < mainJSONObj.filings.files.length; i++) {
          // Conditional ensures filing range falls WITHIN user-input range so as NOT to download unneeded data
          if (
            mainJSONObj.filings.files[i].filingFrom >=
              startDateforExpandedRange &&
            mainJSONObj.filings.files[i].filingTo <= endDateforExpandedRange
          ) {
            const assembledURLJSON =
              "https://data.sec.gov/submissions/" +
              mainJSONObj.filings.files[i].name;

            const fetchRequest = await fetch(assembledURLJSON, {
              method: "GET",
              headers: {
                "User-Agent": "Brett Webster websterbrett@gmail.com",
                "Accept-Encoding": "gzip, deflate",
              },
            });
            const fetchRequestText = await fetchRequest.text();
            promisesArr.push(fetchRequestText);

            console.log(
              assembledURLJSON,
              "assembledURLJSON.....all 'appendix' links"
            );
          }
        }

        // Use Promise.all for multiple fetch requests in parallel to capture entirety of data output once processing of all parts is complete
        const JSONinTxtFormatArr = await Promise.all(promisesArr); // CHANGED FROM additionalJSONsinTxtFormat to JSONinTxtFormatArr, converted from .then() promise-chaining

        // Convert downloaded JSON text back into object using .parse() method
        for (let i = 0; i < JSONinTxtFormatArr.length; i++) {
          embeddedJSONObject = JSON.parse(JSONinTxtFormatArr[i]);

          const subArrOfassembledURLsToAdd = getLessRecentJSONdata(
            embeddedJSONObject,
            fullCIK,
            startDateforExpandedRange,
            endDateforExpandedRange
          ); // Helper function, imported & invoked to assemble non-recent URLs of financial statements into a subArray to be added to main array

          arrOfassembledURLs = arrOfassembledURLs.concat(
            subArrOfassembledURLsToAdd
          );
        }

        res.locals.arrOfassembledURLs = arrOfassembledURLs; // Assign to res.locals, updating .arrOfassembledURLs property
        return next();
      }
    } catch (err) {
      return next({
        log: "processDataController.createLessRecentURLsAndGrabJSON:  Middleware error in fetching/saving 'appendix' objects containing non-recent financial statement URLs",
        message: {
          err: `processDataController.createLessRecentURLsAndGrabJSON: ${err}`,
        },
      });
    }
  };
};

// --------

// Iterate thru array of assembled financial statement URLs & create an equal-sized array of promises that will all (ideally) resolve to .txt format, each element of which can then be DOM-parsed in the next middleware function
// Using Promise.all here for its concurrent nature & error-handling (i.e. if one promise fails, they all fail -- so need to inspect further/debug)
processDataController.fetchAllURLsInTxtFormat = async (req, res, next) => {
  try {
    const { outputObject, arrOfassembledURLs } = res.locals;

    if (typeof outputObject === "object")
      return next(); // If outputObject has already been populated (i.e. no longer type 'string'), no need to do extra work, skip to next middleware fxn & all the way thru end of chain..
    else {
      console.log("FINAL arrOfassembledURLs:  ", arrOfassembledURLs);
      // Construct another fetchRequest array containing assembled URLs and again use Promise.all for multiple fetch requests in parallel to capture entirety of data output
      promisesArr = [];
      for (let i = 0; i < arrOfassembledURLs.length; i++) {
        const fetchRequest = await fetch(arrOfassembledURLs[i], {
          method: "GET",
          headers: {
            "User-Agent": "Brett Webster websterbrett@gmail.com",
            "Accept-Encoding": "gzip, deflate",
          },
        });
        const fetchRequestText = await fetchRequest.text();
        promisesArr.push(fetchRequestText);
      }

      // Use Promise.all for multiple fetch requests in parallel to capture entirety of data output once processing of all parts is complete
      const URLinTxtFormatArr = await Promise.all(promisesArr);

      res.locals.URLinTxtFormatArr = URLinTxtFormatArr; // Assign to res.locals
      return next();
    }
  } catch (err) {
    return next({
      log: "processDataController.fetchAllURLsInTxtFormat:  Middleware error occurrred during construction of array of URL-based fetch promises that eventually resolve to an array of elements containing actual financial statement texts to be used to parse",
      message: { err: `processDataController.fetchAllURLsInTxtFormat: ${err}` },
    });
  }
};

// --------

// Using JSDOM library to create & parse DOMs of individual financial statement URLs to tally leading digit counts for select financial line items, passing on cumulative tally via res.locals
// Loop thru all the individual financial statement URLs, applying below logic to each so leading financial statement line item digit count results across them all can be aggregated
processDataController.iterateThruDOMsOfFinalURLarrAndParse = async (
  req,
  res,
  next
) => {
  try {
    const { outputObject, URLinTxtFormatArr, lineItemsObject } = res.locals;

    if (typeof outputObject === "object")
      return next(); // If outputObject has already been populated (i.e. no longer type 'string'), no need to do extra work, skip to next middleware fxn & all the way thru end of chain..
    else {
      const validFinancialLineItemsObject = lineItemsObject;
      let validFinancialLineItemsArr = Object.values(
        validFinancialLineItemsObject
      );
      const combinedFinalArrOfFinancialNums = [];

      // Iterate through entirety of URLinTxtFormatArr array, creating a new DOM for each URL, parsing each
      for (let i = 0; i < URLinTxtFormatArr.length; i++) {
        // Initialize DOM & pull relevant parts of webpage structure based on below tree structure
        const dom = new JSDOM(URLinTxtFormatArr[i]);

        const lineItemNameAndNumObject = {};
        let HTMLelemsTaggedInCurrentURL = false; // Unused --> manual parsing flag
        for (let j = 0; j < validFinancialLineItemsArr.length; j++) {
          //Create DOM of each valid financial line item (used to search SEC EDGAR URL filing previously pulled down)
          const namedTextElements = dom.window.document.getElementsByName(
            validFinancialLineItemsArr[j]
          );

          // Filter for financial line items (1) actually present within company's filing URL and (2) included in the master list (validFinancialLineItemsObject)
          if (
            namedTextElements.length > 0 &&
            validFinancialLineItemsArr[j] in validFinancialLineItemsObject
          ) {
            HTMLelemsTaggedInCurrentURL = true; // Unused --> manual parsing flag
            const financialLineItemName =
              namedTextElements[0].getAttribute("name");

            // Filter out irrelevant items, adding relevant items to a new object lineItemNameAndNumObject with key/value pair as follows: (1) concatenated financial line item name attribute + its corresponding value is KEY (2) and the corresponding values as VALUE (in string format)
            // This key structure auto-dedupes as no duplicate keys are permitted in JS objects (a VERY unlikely edge case is where a numeric is repeated across time for the SAME financial line item names)
            for (let k = 0; k < namedTextElements.length; k++) {
              const key =
                namedTextElements[0].getAttribute("name") +
                namedTextElements[k].innerHTML;
              const value = namedTextElements[k].innerHTML;
              lineItemNameAndNumObject[key] = value;
            } // end inner for loop
          }
        } // end outer for loop
        dom.window.close();

        // //Iterate through array containing valid financial line items from master list .txt file (validFinancialLineItemsObject), extracting into final array those contained in the lineItemNameAndNumObject just extracted from the newly created DOMs
        const finalArrOfLineItems = [];
        const finalArrOfFinancialNums = [];
        let counter = 0;
        // Only add pairs possessing an acceptable key format
        for (let [key, value] of Object.entries(lineItemNameAndNumObject)) {
          if (key[key.length - 1] !== ">") {
            counter++;
            finalArrOfLineItems.push(key);
            finalArrOfFinancialNums.push(value);
          }
        }
        console.log(
          finalArrOfFinancialNums.length,
          finalArrOfFinancialNums,
          "finalArrOfFinancialNums..."
        );
        combinedFinalArrOfFinancialNums.push(finalArrOfFinancialNums);
      } // end outermost for loop

      res.locals.combinedFinalArrOfFinancialNums =
        combinedFinalArrOfFinancialNums; // Assign to res.locals -- this is the combined array of raw results subarrays containing financial numerics to be processed and aggregated into single cumulative results array [10 elements] in next middleware
      return next();
    }
  } catch (err) {
    return next({
      log: "processDataController.iterateThruDOMsOfFinalURLarrAndParse:  Middleware error occurred in creating & parsing DOM of individual financial statement URL to tally leading digit counts for select financial line items",
      message: {
        err: `processDataController.iterateThruDOMsOfFinalURLarrAndParse: ${err}`,
      },
    });
  }
};

// --------

processDataController.compressOutputArrs = (req, res, next) => {
  try {
    // Iterate thru each subarray containing raw financial statement numbers, placing the leading digits frequencies into their respective slot in each new subarray
    const { outputObject, combinedFinalArrOfFinancialNums } = res.locals;

    if (typeof outputObject === "object")
      return next(); // If outputObject has already been populated (i.e. no longer type 'string'), no need to do extra work, skip to next middleware fxn & all the way thru end of chain..
    else {
      const outerArr = [];
      for (let i = 0; i < combinedFinalArrOfFinancialNums.length; i++) {
        const observedFreqOfLeadingDigitArrCount = Array(10).fill(0);
        combinedFinalArrOfFinancialNums[i].forEach((element) => {
          if (element[0] !== "0" && !element.includes("—")) {
            observedFreqOfLeadingDigitArrCount[Number(element[0])]++;
          }
        });
        outerArr.push(observedFreqOfLeadingDigitArrCount);
      }
      console.log("outerArr (processed raw data into subarrays): ", outerArr);

      // With the processed array of subarrays (outerArr) containing leading frequencies, merge these subarrays into a single, summed final results array for displaying
      let outputDataIsEmptyBoolean = true; // Adding flag here to send back to client for presentation of result, default set to empty data

      const zeroArr = Array(10).fill(0); // Initialize starting array populated w/ 0s

      // Populate all NON-INTEGER elements w/ 0s in initial subarray to avoid errors in reducer method
      if (outerArr[0]) {
        outerArr[0].forEach((elem, index, arr) => {
          if (!Number.isInteger(elem)) arr[index] = 0;
        });
      } else console.log("No output data");

      const summedSubArrs = outerArr.reduce(
        (cumulativeSubArr, currentSubArr) => {
          const newArr = cumulativeSubArr.map((elem, index) => {
            if (Number.isInteger(currentSubArr[index]))
              return elem + currentSubArr[index];
            else return elem;
          }); // end map method
          return newArr;
        },
        zeroArr
      );

      // An array of 10 integers should always be sent back -- return "empty feedback" in case where all digits = 0 (no NaNs or errors should exist) <-- noOutputDataBoolean = true.  Attach this to outputObject & send back to client.  If true, signal to NOT render any charting but instead a message
      for (let i = 0; i < 10; i++) {
        if (summedSubArrs[i] !== 0) outputDataIsEmptyBoolean = false;
      }

      res.locals.outputDataIsEmptyBoolean = outputDataIsEmptyBoolean; // Assign to res.locals
      res.locals.finalArrOfFreqs = summedSubArrs;
      return next();
    }
  } catch (err) {
    return next({
      log: "processDataController.compressOutputArrs:  Middleware error in collapsing subarray results into a single array for analysis/presentation",
      message: { err: `processDataController.compressOutputArrs: ${err}` },
    });
  }
};

// --------

// Initialize distribution frequency array [0..9], 0 being unused since not a leading digit.  Then increment each leading digit's bucket, where applicable.
// Once populated, scale on a % distribution frequency basis for comparison purposes & pass along results object via res.locals
processDataController.calculateAndDisplayBenfordResults = (req, res, next) => {
  try {
    let {
      outputObject,
      outputDataIsEmptyBoolean,
      finalArrOfFreqs,
      arrOfassembledURLs,
    } = res.locals;

    if (typeof outputObject === "object")
      return next(); // If outputObject has already been populated (i.e. no longer type 'string'), no need to do extra work, skip to next middleware fxn & all the way thru end of chain..
    else {
      const sumOfLeadingDigitsCount = finalArrOfFreqs.reduce(
        (accumulator, value) => {
          return accumulator + value;
        },
        0
      );

      let observedFreqOfLeadingDigitArrPercentages = [];
      finalArrOfFreqs.forEach((element) => {
        observedFreqOfLeadingDigitArrPercentages.push(
          element / sumOfLeadingDigitsCount
        );
      });

      // Create theoretical discrete Benford distribution as comparative benchmark
      let benfordFreqOfLeadingDigitArrPercentages = [];
      for (let i = 0; i < 10; i++) {
        if (i !== 0) {
          benfordFreqOfLeadingDigitArrPercentages.push(Math.log10(1 / i + 1));
        } else benfordFreqOfLeadingDigitArrPercentages.push(0);
      }

      // Compute Kolmogorov-Smirnoff (K-S) statistics
      const criticalValue5Percent = 1.36 / Math.sqrt(sumOfLeadingDigitsCount);
      const criticalValue1Percent = 1.63 / Math.sqrt(sumOfLeadingDigitsCount);

      // Compute absolute differences in % terms for each digit's frequency comparing observed vs theoretical Benford curve, find absolute maximum and compare against critical values of 5% and 1% to assess Benford conformity
      let observedMinusBenfordPercentagesAbsDiffsArr = [];
      let absDelta;
      for (let i = 0; i < 10; i++) {
        if (i !== 0) {
          absDelta = Math.abs(
            observedFreqOfLeadingDigitArrPercentages[i] -
              benfordFreqOfLeadingDigitArrPercentages[i]
          );
          observedMinusBenfordPercentagesAbsDiffsArr.push(absDelta);
        } else observedMinusBenfordPercentagesAbsDiffsArr.push(0);
      }

      // FINAL STEP:  Assign results variables + output array to object being returned by function back to server.js; input data to be appended before sending back to client
      outputObject = {};
      outputObject.outputDataIsEmptyBoolean = outputDataIsEmptyBoolean;
      outputObject.quarters = arrOfassembledURLs.length || 0; // Assumes all are populated
      outputObject.finalArrOfFreqs = finalArrOfFreqs;
      outputObject.arrForChart = observedFreqOfLeadingDigitArrPercentages;
      outputObject.maxKSdifference = Math.max(
        ...observedMinusBenfordPercentagesAbsDiffsArr
      );
      outputObject.selectedLeadingDigit =
        observedMinusBenfordPercentagesAbsDiffsArr.indexOf(
          outputObject.maxKSdifference
        );
      outputObject.highestLeadingDigitCount =
        finalArrOfFreqs[outputObject.selectedLeadingDigit];
      outputObject.totalLeadingDigitsCount = sumOfLeadingDigitsCount;

      // Evaluate observed frequency data at 5% and 1% critical value levels & assign
      if (outputObject.maxKSdifference < criticalValue5Percent)
        outputObject.results5pcCritical = "FAIL TO REJECT";
      else outputObject.results5pcCritical = "REJECT";

      if (outputObject.maxKSdifference < criticalValue1Percent)
        outputObject.results1pcCritical = "FAIL TO REJECT";
      else outputObject.results1pcCritical = "REJECT";

      res.locals.outputObject = outputObject; // Assign to res.locals, to be destructured & eventually sent back to client upon successful completion of middleware chain
      return next();
    }
  } catch (err) {
    return next({
      log: "processDataController.calculateAndDisplayBenfordResults:  Middleware error in calculating and analyzing the resultant area vs. expected Benford distribution",
      message: {
        err: `processDataController.calculateAndDisplayBenfordResults: ${err}`,
      },
    });
  }
};

// --------

// Write ALL search results to 'pastresults' table in db if output data table is NOT empty (caching for future reference)
processDataController.writeResultsToDB = async (req, res, next) => {
  try {
    const { outputObject, outputDataIsEmptyBoolean, timeLabel } = res.locals;
    const { company, ticker, CIK, startDate, endDate } = req.body.inputObject; // destructure req.body object originally sent from client

    outputObject.company = company;
    outputObject.ticker = ticker;
    outputObject.CIK = CIK;
    outputObject.startDate = startDate;
    outputObject.endDate = endDate;

    // Only if output data array is NOT empty, then create field entries & write to 'pastresults' SQL table
    if (!outputDataIsEmptyBoolean) {
      const cikPlusDateRange = CIK + startDate + endDate;
      let username = "guest"; // default = guest
      if (req.cookies.ssid) username = req.cookies.ssid;
      const outputObjectStr = JSON.stringify(outputObject);

      // Read from db in order to find username id (foreign key in 'pastresults' table)
      let userID;
      if (username === "guest")
        userID = 11; // NOTE:  change this as needed, inserted manually into 'users' table to satisfy foreign key constraint
      else {
        const findUserIDQuery = `
            SELECT id FROM users
            WHERE username = $1;
        `;
        const values = [username];
        const { rows } = await db.query(findUserIDQuery, values);
        userID = rows[0].id;
        console.log("UserID found:  ", rows[0]);
      }

      // Write to db, adding (CREATE) new search result into SQL db - do this for ALL queries, even if duplicate searches
      const createDataResultsQuery = `
        INSERT INTO pastresults
        (cikplusdaterange, user_id, outputobject)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const values = [cikPlusDateRange, userID, outputObjectStr];
      const { rows } = await db.query(createDataResultsQuery, values);
      console.log("NEW search result data added to db:  ", rows[0]);
    } else
      console.log(
        "Output array is EMPTY, NOT written to 'pastresults' table in db..."
      );

    res.locals.outputObject = outputObject; // Assign to res.locals, to be destructured & eventually sent back to client upon successful completion of middleware chain
    console.timeEnd(timeLabel); // Mark time here
    return next();
  } catch (err) {
    return next({
      log: "processDataController.writeResultsToDB:  Middleware error in writing to 'pastresults' table in db",
      message: {
        err: `processDataController.writeResultsToDB: ${err}`,
      },
    });
  }
};

// --------

module.exports = processDataController;

// --------
