const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");

async function getDataFromSECedgarJSONandProcess(
  inputCIK,
  startDateforRange,
  endDateforRange
) {
  console.log("test whether running");
  let timeLabel;
  console.time(timeLabel);

  // -----------------------------

  // ++ Helper function, self-executing:  creates validFinancialLineItemsObject
  // *** READ THIS INTO node-local storage, if faster??  ***
  // Initialize validFinancialLineItemsObject object containing all Benford-eligible financial line items by importing from below .txt file.
  // Omit line items that are NOT applicable OR are derivatives of other line items (e.g. Net Income derives from Revenue & Expenses, and is therefore omitted from the master list)
  const validFinancialLineItemsObject = (() => {
    const contents = fs.readFileSync(
      path.resolve(__dirname, "./validFinancialLineItems.txt")
    );

    let validFinancialLineItemsArr = contents.toString().split(/\r?\n/); // NOTE:  Can add "utf-8" w/in fs.readFileSync IN PLACE of .toString()

    // console.log(typeof contents, contents.toString());
    // console.log(validFinancialLineItemsArr);
    // Convert validFinancialLineItems from array into object
    const lineItemsObject = validFinancialLineItemsArr.reduce(
      (combined, currentValue) => ({
        ...combined,
        [currentValue]: currentValue,
      }),
      {}
    );
    return lineItemsObject;
  })();
  //   console.log(
  //     "TESTING for validFinancialLineItemsObject:",
  //     validFinancialLineItemsObject
  //   );

  // -----------------------------

  // Once submit button is clicked with acceptable inputs, construct company-specific URL, pull all relevant 10-K and 10-Q filing URLS from SEC EDGAR's company-specific JSON data (saving these into a URL array)
  console.log(
    "INSIDE getDataFromSECedgarJSONandProcess:  ",
    inputCIK,
    startDateforRange,
    endDateforRange
  );

  // Extract & parse SEC EDGAR's JSON file for the specified public company filer in order extract all relevant URLs within the given time frame
  let urlWithJSON = "https://data.sec.gov/submissions/CIK" + inputCIK + ".json";

  //TEMPORARILY USE BELOW DATES IF USER INPUT NOT FUNCTIONING
  //   startDateforRange = "2019-01-01";
  //   endDateforRange = "2022-10-01";

  let arrOfassembledURLs = []; // Only global?

  // -----------------------------

  // ++ Helper function:  getMostRecentJSONdata (grabbing URLs from JSON API, part 1)
  // Use Fetch API wrapped inside a Promise, downloading full SEC EDGAR JSON text and then converting it back into object using .parse() method
  //
  async function getMostRecentJSONdataAndReturnJSONobject() {
    let mainJSONObj;
    try {
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
      mainJSONObj = await response.json();
    } catch (error) {
      console.log(
        "Error in getMostRecentJSONdata fetching urlWithJSON: ",
        error
      );
    }

    const cik = mainJSONObj.cik;
    const name = mainJSONObj.name;
    const formArr = mainJSONObj.filings.recent.form;
    const reportDateArr = mainJSONObj.filings.recent.reportDate;
    const accessionNumberArr = mainJSONObj.filings.recent.accessionNumber;
    const primaryDocumentArr = mainJSONObj.filings.recent.primaryDocument;

    // Assemble each valid URL from component parts & then append onto aggregate array of valid URLs
    for (let i = 0; i < accessionNumberArr.length; i++) {
      if (
        (formArr[i] === "10-K" ||
          formArr[i] === "10-Q" ||
          formArr[i] === "20-F" || // NOTE:  These last 2 are for foreign issuers
          formArr[i] === "40-F") &&
        reportDateArr[i] >= startDateforRange &&
        reportDateArr[i] <= endDateforRange
      ) {
        // console.log(
        //   "DATE COMPARE: ",
        //   reportDateArr[i],
        //   startDateforRange,
        //   endDateforRange,
        //   reportDateArr[i] >= startDateforRange,
        //   reportDateArr[i] <= endDateforRange
        // );
        const assembledURLhtm =
          "https://www.sec.gov/Archives/edgar/data/" +
          cik +
          "/" +
          accessionNumberArr[i].replace(/-/g, "") +
          "/" +
          primaryDocumentArr[i];
        //   console.log(assembledURLhtm);
        arrOfassembledURLs.push(assembledURLhtm);
      }
    }
    // console.log(
    //   "arrOfassembledURLs (Step 1):  ",
    //   arrOfassembledURLs.length,
    //   arrOfassembledURLs
    // );
    // console.log(mainJSONObj.filings, "mainJSONObj.filings...");  // Works OK
    return mainJSONObj;

    // TO BE USED FOR middleware in FUTURE
    // res.locals.mainJSONObj = mainJSONObj;
    // res.locals.arrOfassembledURLs = arrOfassembledURLs;
  }
  // ++ Invoke Helper function:  getMostRecentJSONdataAndReturnJSONobject
  //   getMostRecentJSONdataAndReturnJSONobject();
  //   console.log(mainJSONObject, "mainJSONObject.filings...");
  //   console.log(".then() ", getMostRecentJSONdataAndReturnJSONobject());

  // -----------------------------

  // Using promise chaining to return the resolved mainJSONObject for usage in the next function, invoked within
  getMostRecentJSONdataAndReturnJSONobject().then((mainJSONObject) => {
    // console.log("mainJSONObject as resolved...", mainJSONObject);
    // Invoking function below
    createLessRecentURLsAndGrabJSON(mainJSONObject);
  });

  // -----------------------------

  // Call above functions that wrap fetch APIs in order to grab and parse JSON files.  Then pull URLs to any additional JSON files so that their data can be extracted
  // Finalizes assembly of valid URLs for grabbing their JSON
  async function createLessRecentURLsAndGrabJSON(mainJSONObject) {
    const additionalJSONurlsArr = [];
    // console.log(arrOfassembledURLs);
    // console.log(additionalJSONurlsArr);

    let promisesArr = [];
    let fetchRequest;

    // Adjust data range to grab slightly more data than is required & squarely matches SEC submission data (i.e. 2 additional submission files where user-inputted start and end dates fall within the submission range) -- dates outside user-input range will be subsequently filtered out
    let startDateforExpandedRange = startDateforRange; // Set defaults in case way out of range
    let endDateforExpandedRange = endDateforRange;
    for (let i = 0; i < mainJSONObject.filings.files.length; i++) {
      if (
        startDateforRange >= mainJSONObject.filings.files[i].filingFrom &&
        startDateforRange <= mainJSONObject.filings.files[i].filingTo
      ) {
        startDateforExpandedRange = mainJSONObject.filings.files[i].filingFrom;
      }
      if (
        endDateforRange >= mainJSONObject.filings.files[i].filingFrom &&
        endDateforRange <= mainJSONObject.filings.files[i].filingTo
      ) {
        endDateforExpandedRange = mainJSONObject.filings.files[i].filingTo;
      }
    }
    // console.log(
    //   "expandedDateRange:  ",
    //   startDateforExpandedRange,
    //   endDateforExpandedRange
    // );

    // Extract JSON links going back MORE THAN 1,000 entries into a separate array, iterate through this array to add additional, valid historic URLs onto aggregate array
    for (let i = 0; i < mainJSONObject.filings.files.length; i++) {
      // Conditional ensures filing range falls WITHIN user-input range so as NOT to download unneeded data
      if (
        mainJSONObject.filings.files[i].filingFrom >=
          startDateforExpandedRange &&
        mainJSONObject.filings.files[i].filingTo <= endDateforExpandedRange
      ) {
        const assembledURLJSON =
          "https://data.sec.gov/submissions/" +
          mainJSONObject.filings.files[i].name;

        fetchRequest = fetch(assembledURLJSON, {
          method: "GET",
          headers: {
            // 'Content-Type': 'application/json',
            //  INSTRUCTIONS for SETTING user-agent REQUEST HEADER:  https://www.sec.gov/os/accessing-edgar-data
            "User-Agent": "Brett Webster websterbrett@gmail.com",
            "Accept-Encoding": "gzip, deflate",
          },
        }).then((response) => response.text());
        promisesArr.push(fetchRequest);
        // console.log(
        //   "FULLassembledURLJSON.length, assembledURLJSON: ",
        //   assembledURLJSON
        // );
      }
    }

    // console.log("promisesArr: ", promisesArr);
    // Promise.all(promisesArr).then((values) => console.log("values", values));

    // Use Promise.all for multiple fetch requests in parallel to capture entirety of data output once processing of all parts is complete
    const additionalJSONsinTxtFormat = Promise.all(promisesArr);
    additionalJSONsinTxtFormat.then((JSONinTxtFormatArr) => {
      // console.log(JSONinTxtFormatArr[2]);
      // Convert downloaded JSON text back into object using .parse() method
      for (let i = 0; i < JSONinTxtFormatArr.length; i++) {
        embeddedJSONObject = JSON.parse(JSONinTxtFormatArr[i]);
        getLessRecentJSONdata(embeddedJSONObject); // Helper function
      }
      console.log(
        "arrOfassembledURLs (Step 2):  ",
        arrOfassembledURLs.length,
        arrOfassembledURLs
      );
      finalArrOfNums = [];
      iterateThruDOMsOfFinalURLarrAndParse(arrOfassembledURLs);
      // res.locals.arrOfassembledURLs = arrOfassembledURLs;
    });
  }

  // -----------------------------

  // ++ Helper function:  getLessRecentJSONdata (grabbing additional URLs from JSON API, part 2)
  // Iterate through array of extracted JSON links going back MORE THAN 1,000 filings
  // Add valid historic URLs onto aggregate array of URLs to parse for financial data
  function getLessRecentJSONdata(embeddedJSONObject) {
    // console.log(
    //   "embeddedJSONObject inside getLessRecentJSONdata: ",
    //   embeddedJSONObject
    // );

    // Noting here that the below JSON structure DIFFERS from the (part 1 structure above) containing ONLY 1st 1,000 entries
    const formArr = embeddedJSONObject.form;
    const reportDateArr = embeddedJSONObject.reportDate;
    const accessionNumberArr = embeddedJSONObject.accessionNumber;
    const primaryDocumentArr = embeddedJSONObject.primaryDocument;

    // Assemble each valid URL from component parts & then append onto aggregate array of valid URLs
    for (let i = 0; i < accessionNumberArr.length; i++) {
      if (
        (formArr[i] === "10-K" ||
          formArr[i] === "10-Q" ||
          formArr[i] === "20-F" || // NOTE:  These last 2 are for foreign issuers
          formArr[i] === "40-F") &&
        reportDateArr[i] >= startDateforRange &&
        reportDateArr[i] <= endDateforRange
      ) {
        assembledURLhtm =
          "https://www.sec.gov/Archives/edgar/data/" +
          inputCIK +
          "/" +
          accessionNumberArr[i].replace(/-/g, "") +
          "/" +
          primaryDocumentArr[i];
        // console.log(assembledURLhtm);
        arrOfassembledURLs.push(assembledURLhtm);
      }
    }
    // TO BE USED FOR middleware in FUTURE
    // res.locals.mainJSONObject = mainJSONObject;  // pass along
    // res.locals.arrOfassembledURLs = arrOfassembledURLs;
  }

  // -----------------------------

  // BELOW USES final array assembly of valid URLs & calls fxn to parse each DOM & pull leading digits
  function iterateThruDOMsOfFinalURLarrAndParse(arrOfassembledURLs) {
    console.log(
      "arrOfassembledURLs (Step 3):  ",
      arrOfassembledURLs.length,
      arrOfassembledURLs
    );

    // Construct another fetchRequest array containing assembled URLs and again use Promise.all for multiple fetch requests in parallel to capture entirety of data output
    promisesArr = [];
    for (let i = 0; i < arrOfassembledURLs.length; i++) {
      fetchRequest = fetch(arrOfassembledURLs[i], {
        method: "GET",
        // body: JSON.stringify(body),
        headers: {
          // 'Content-Type': 'application/json',
          //  INSTRUCTIONS for SETTING user-agent REQUEST HEADER:  https://www.sec.gov/os/accessing-edgar-data
          "User-Agent": "Brett Webster websterbrett@gmail.com",
          "Accept-Encoding": "gzip, deflate",
        },
      }).then((response) => response.text());
      promisesArr.push(fetchRequest);
    }

    // Use Promise.all for multiple fetch requests in parallel to capture entirety of data output once processing of all parts is complete
    const allURLsInTxtFormat = Promise.all(promisesArr);
    allURLsInTxtFormat.then((URLinTxtFormatArr) => {
      //   console.log("URLinTxtFormatArr.length: ", URLinTxtFormatArr.length);  // REMOVED
      // Initialize output file for ease of reference
      //   fs.writeFile("./output2.txt", "", (err) => {
      //     if (err) throw err;
      //   });

      // Iterate through entirety of URLinTxtFormatArr array, invoking function to create a new DOM for each URL, parsing each
      const lenURLinTxtFormatArr = URLinTxtFormatArr.length;
      for (let i = 0; i < lenURLinTxtFormatArr; i++) {
        createAndParseDOMofEachURL(
          URLinTxtFormatArr[i],
          i,
          lenURLinTxtFormatArr,
          validFinancialLineItemsObject
        );
      }
      //FOR TESTING ONLY
      // for (let i = 0; i < 1; i++) {
      //   createAndParseDOMofEachURL(URLinTxtFormatArr[2]);
      //   console.log(arrOfassembledURLs[2]);
      // }
      // res.locals.finalArrOfNums = finalArrOfNums;  // NEED TO SUM THIS w/ OTHERS vs one-by-one
      console.timeEnd(timeLabel);
    });
  }

  // ---------------------------------------------------------

  // Helper function invoked within iterateThruDOMsOfFinalURLarrAndParse
  // This function is called to create a parsable DOM of each SEC EDGAR website URL in text format found within the assembled array for a company's 10-k/10-Q, time-specified by user
  function createAndParseDOMofEachURL(
    URLtext,
    filingCounter,
    lenURLinTxtFormatArr,
    validFinancialLineItemsObject
  ) {
    // console.log(URLtext);
    fs.writeFile("./output1.txt", URLtext, (err) => {
      if (err) throw err;
    });

    // Initialize DOM & pull relevant parts of webpage structure based on below tree structure
    const dom = new JSDOM(URLtext);

    // Iterate thru entire validFinancialLineItemsObject once converted to array arrOfValidFinancialLineItems, checking for each Name descriptor & pulling out text for each
    let arrOfValidFinancialLineItems = Object.values(
      validFinancialLineItemsObject
    );

    let namedTextElements;
    // TEST CODE ONLY
    // namedTextElements = dom.window.document.getElementsByName(
    //   "us-gaap:CashAndCashEquivalentsAtCarryingValue"
    // );
    // console.log(namedTextElements.length);
    // console.log(
    //   namedTextElements[0].getAttribute("name"),
    //   namedTextElements[0].innerHTML
    // );
    // console.log(
    //   namedTextElements[1].getAttribute("name"),
    //   namedTextElements[1].innerHTML
    // );

    // console.log("us-gaap:Revenues" in validFinancialLineItemsObject);

    let financialLineItemName;
    let financialLineItemValuesArr;
    let key;
    let value;
    let lineItemNameAndNumObject = {};
    for (let i = 0; i < arrOfValidFinancialLineItems.length; i++) {
      //Create DOM of each valid financial line item, used to search SEC EDGAR URL filing
      namedTextElements = dom.window.document.getElementsByName(
        arrOfValidFinancialLineItems[i]
      );
      // console.log(namedTextElements.length);

      // Filter for financial line items (1) actually present within company's filing URL and (2) included in the master list
      if (
        namedTextElements.length > 0 &&
        arrOfValidFinancialLineItems[i] in validFinancialLineItemsObject
      ) {
        financialLineItemName = namedTextElements[0].getAttribute("name");
        financialLineItemValuesArr = [];
        // console.log(financialLineItemName, namedTextElements.length);

        // Filter out irrelevant items, adding relevant items to a new object lineItemNameAndNumObject with key/value pair as follows: (1) concatenated financial line item name attribute + its corresponding value is KEY (2) and the corresponding values as VALUE (in string format)
        // This key structure auto-dedupes because no duplicate keys are permitted in JS objects (an unlikely edge case is where a numeric is repeated across time for the SAME financial line item names)
        for (let j = 0; j < namedTextElements.length; j++) {
          key =
            namedTextElements[0].getAttribute("name") +
            namedTextElements[j].innerHTML;
          value = namedTextElements[j].innerHTML;
          lineItemNameAndNumObject[key] = value;
        }
        // const numObservations = Object.keys(lineItemNameAndNumObject).length;
        // console.log(numObservations);
      }
    }
    // console.log(lineItemNameAndNumObject);

    // //Iterate through array containing valid financial line items from .txt file, extracting into final array those contained in object
    let finalArrOfLineItems = [];
    let finalArrOfNums = [];
    let i = 0;

    // Only add pairs with acceptable key format
    for (let [key, value] of Object.entries(lineItemNameAndNumObject)) {
      if (key[key.length - 1] !== ">") {
        i++;
        // console.log(key, value, i);
        finalArrOfLineItems.push(key);
        finalArrOfNums.push(value);
      }
    }
    // console.log(finalArrOfNums.length, finalArrOfNums); // REMOVED!

    // Append financial line items and their values to .txt file for ease of reading
    fs.appendFile(
      "./output2.txt",
      "\n\n" +
        `Filing #${filingCounter + 1}` +
        "\n" +
        Object.values(finalArrOfLineItems).join("\n"),
      (err) => {
        if (err) throw err;
      }
    );
    // fs.appendFile(
    //   "./output2.txt",
    //   "\n\n" + Object.values(finalArrOfNums).join("\n"),
    //   (err) => {
    //     if (err) throw err;
    //   }
    // );

    calculateAndDisplayBenfordResults(finalArrOfNums, lenURLinTxtFormatArr);
  }

  // -----------------------------

  const processedObj = {}; // MOVE?
  const outerArr = [];
  function calculateAndDisplayBenfordResults(
    finalArrOfNums,
    lenURLinTxtFormatArr
  ) {
    //Initialize distribution frequency array [0..9], 0 being unused since not a leading digit.
    // Then increment each leading digit's bucket, where applicable.
    // Once populated, scale on a % distribution frequency basis for comparison purposes
    let observedFreqOfLeadingDigitArrCount = Array(10).fill(0);
    finalArrOfNums.forEach((element) => {
      if (element[0] !== "0" && !element.includes("—")) {
        //console.log(element);
        observedFreqOfLeadingDigitArrCount[Number(element[0])]++;
      }
    });
    const sumOfLeadingDigitsCount = observedFreqOfLeadingDigitArrCount.reduce(
      (accumulator, value) => {
        return accumulator + value;
      },
      0
    );
    let observedFreqOfLeadingDigitArrPercentages = [];
    observedFreqOfLeadingDigitArrCount.forEach((element) => {
      observedFreqOfLeadingDigitArrPercentages.push(
        element / sumOfLeadingDigitsCount
      );
    });

    // LAST ADDED *** ----------- ***
    outerArr.push(observedFreqOfLeadingDigitArrCount);
    console.log("outerArr:  ", outerArr);
    console.log(
      "Still processing, DOM parsing this much content takes a while..."
    );

    if (outerArr.length === lenURLinTxtFormatArr) {
      const zeroArr = Array(10).fill(0); // WHEN TESTING, ENSURE # 10 matches test array size -- same for summedSubArrs[i] loop below

      // Populate all NON-INTEGER elements w/ 0s in initial subarray to avoid errors in reducer method
      if (outerArr[0].length) {
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
      console.log("summedSubArrs:  ", summedSubArrs);
    }
    // LAST ADDED *** ----------- ***

    // Create theoretical discrete Benford distribution as comparative benchmark
    let benfordFreqOfLeadingDigitArrPercentages = [];
    for (let i = 0; i < 10; i++) {
      if (i !== 0) {
        benfordFreqOfLeadingDigitArrPercentages.push(Math.log10(1 / i + 1));
      } else benfordFreqOfLeadingDigitArrPercentages.push(0);
    }
    // console.log(observedFreqOfLeadingDigitArrCount);
    // console.log(sumOfLeadingDigitsCount);
    // console.log(observedFreqOfLeadingDigitArrPercentages);
    // console.log(benfordFreqOfLeadingDigitArrPercentages);

    // Compute Kolmogorov-Smirnoff (K-S) statistics
    const criticalValue5Percent = 1.36 / Math.sqrt(sumOfLeadingDigitsCount);
    const criticalValue1Percent = 1.63 / Math.sqrt(sumOfLeadingDigitsCount);
    // console.log(criticalValue5Percent, criticalValue1Percent);

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

    // FINAL STEP:  Assign results variables + output array to object being returned by function back to server.js
    processedObj.quarters = 99;
    // processedObj.quarters = arrOfassembledURLs.length || 0;
    processedObj.arr = observedMinusBenfordPercentagesAbsDiffsArr;
    processedObj.maxKSdifference = Math.max(
      ...observedMinusBenfordPercentagesAbsDiffsArr
    );
    //   console.log(observedMinusBenfordPercentagesAbsDiffsArr);

    processedObj.selectedLeadingDigit =
      observedMinusBenfordPercentagesAbsDiffsArr.indexOf(
        processedObj.maxKSdifference
      );
    processedObj.highestLeadingDigitCount =
      observedFreqOfLeadingDigitArrCount[processedObj.selectedLeadingDigit];
    processedObj.totalLeadingDigitsCount = sumOfLeadingDigitsCount;

    // Evaluate observed frequency data at 5% and 1% critical value levels & assign
    if (processedObj.maxKSdifference < criticalValue5Percent)
      processedObj.results5pcCritical = "FAIL TO REJECT";
    else processedObj.results5pcCritical = "REJECT";

    if (processedObj.maxKSdifference < criticalValue1Percent)
      processedObj.results1pcCritical = "FAIL TO REJECT";
    else processedObj.results1pcCritical = "REJECT";
  } // end function calculateAndDisplayBenfordResults

  return processedObj;
  // return [99]; // REMOVE
} // end function getDataFromSECedgarJSONandProcess

// ------------

module.exports = getDataFromSECedgarJSONandProcess;

// ------------
