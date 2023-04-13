// ++ Helper function for processDataController.createLessRecentURLsAndGrabJSON fxn, invoked by but NOT part of actual middleware chain

// getLessRecentJSONdata grabs additional URLs from JSON API, part 2 of process.  Iterates through array of extracted JSON links going back MORE THAN 1,000 filings
// Add valid historic URLs onto aggregate array of URLs for subsequent financial data parsing
function getLessRecentJSONdata(
  embeddedJSONObject,
  fullCIK,
  startDateforExpandedRange,
  endDateforExpandedRange
) {
  // Noting here that the below JSON structure DIFFERS from the (part 1 structure above) containing ONLY 1st 1,000 entries
  const formArr = embeddedJSONObject.form;
  const reportDateArr = embeddedJSONObject.reportDate;
  const accessionNumberArr = embeddedJSONObject.accessionNumber;
  const primaryDocumentArr = embeddedJSONObject.primaryDocument;

  // Assemble each valid URL from component parts & then append onto aggregate array of valid URLs
  const subArrOfassembledURLs = [];
  for (let i = 0; i < accessionNumberArr.length; i++) {
    if (
      (formArr[i] === "10-K" ||
        formArr[i] === "10-Q" ||
        formArr[i] === "20-F" || // NOTE:  These last 2 are for foreign issuers
        formArr[i] === "40-F") &&
      reportDateArr[i] >= startDateforExpandedRange &&
      reportDateArr[i] <= endDateforExpandedRange
    ) {
      assembledURLhtm =
        "https://www.sec.gov/Archives/edgar/data/" +
        fullCIK +
        "/" +
        accessionNumberArr[i].replace(/-/g, "") +
        "/" +
        primaryDocumentArr[i];

      subArrOfassembledURLs.push(assembledURLhtm);
    }
  }
  return subArrOfassembledURLs;
}

module.exports = getLessRecentJSONdata;
