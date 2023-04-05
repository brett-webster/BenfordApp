import React from "react";

const BenfordResultsText = ({ chartDisplayBoolean, outputObject }) => {
  // Passing down 2 props
  return (
    <>
      {chartDisplayBoolean ? (
        <div id="outputResultsText">
          <div style={{ fontWeight: "bold" }}>
            Issuer: {outputObject.company} {"   ("}Ticker: {outputObject.ticker}
            {" <---> "} CIK: {outputObject.CIK}
            {")"}
          </div>
          <div style={{ fontWeight: "bold" }}>
            Time Frame: {outputObject.quarters} quarters
          </div>
          <div style={{ fontWeight: "bold" }}>
            Highest Digit Frequency (count):{" "}
            {outputObject.sumOfLeadingDigitCount}
          </div>
          <div style={{ fontWeight: "bold" }}>
            Total Digits analyzed (count): {outputObject.totalDigitCount}
          </div>
          <br></br>
          <div style={{ fontWeight: "bold", textDecorationLine: "underline" }}>
            RESULTS
          </div>
          <div>{`For a maximum absolute difference of ${outputObject.maxKSdifference} (leading digit ${outputObject.leadingDigit}) between the observed data & the discrete Benford-theoretical curve across ${outputObject.totalDigitCount} observed leading digits...`}</div>
          <br></br>
          <div style={{ color: "red" }}>
            {outputObject.results5pcCritical === "REJECT"
              ? "Reject null hypotheses at the 5% critical level --> CONCLUSION:  Absence of Benford conformity, consider further research"
              : "Fail to reject null hypotheses at the 5% critical level --> CONCLUSION:  Potential Benford conformity"}
          </div>
          <div style={{ color: "red" }}>
            {outputObject.results1pcCritical === "REJECT"
              ? "Reject null hypotheses at the 1% critical level --> CONCLUSION:  Absence of Benford conformity, consider further research"
              : "Fail to reject null hypotheses at the 1% critical level --> CONCLUSION:  Potential Benford conformity"}
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default BenfordResultsText;
