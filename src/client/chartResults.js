import Plotly from "plotly.js-dist";

// Export this MainPage.jsx
const chartBenfordResults = (outputArr) => {
  let benfordFreqOfLeadingDigitArrPercentages = [];
  for (let i = 0; i < 10; i++) {
    if (i !== 0) {
      benfordFreqOfLeadingDigitArrPercentages.push(
        Math.log10(1 / i + 1).toFixed(4)
      );
    } else benfordFreqOfLeadingDigitArrPercentages.push(0);
  }

  const benfordLine = {
    x: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    y: benfordFreqOfLeadingDigitArrPercentages.slice(1),
    type: "scatter",
    line: { color: "red" },
    name: "Benford Prediction by Leading Digit (%)",
  };

  // Convert outputArr elements into decimals in yValuesObserved array
  const yValuesObserved = outputArr.map((elem) => (elem / 10000).toFixed(4));
  const observedBars = {
    x: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    // y: [0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111],
    y: yValuesObserved,
    type: "bar",
    marker: {
      color: "rgb(158,202,0)",
      opacity: 0.6,
      line: {
        color: "rgb(8,48,107)",
        width: 1.5,
      },
    },
    name: "Observed Frequency by Leading Digit (%)",
  };

  const dataToChart = [benfordLine, observedBars];
  const layout = {
    title: "Observed First Digit Frequencies vs. Benford’s Law Predictions",
    xaxis: {
      title: "Leading 1st Digit",
      titlefont: {
        size: 12,
        color: "rgb(107, 107, 107)",
      },
    },
    yaxis: {
      title: {
        text: "Frequency distribution by lead digit (Sum total = 100%)",
        padding: {
          left: 1000,
        },
      },
      titlefont: {
        size: 12,
        color: "rgb(107, 107, 107)",
      },
    },
    autosize: false,
    width: 1150,
    height: 700,
  };

  const TESTER = document.getElementById("chartHanger");
  Plotly.newPlot(TESTER, dataToChart, layout);
};

export default chartBenfordResults;

// -----------------
// ** BELOW USED FOR .png of LANDING PAGE  **

// const chartBenfordResults = (outputArr) => {
//   let benfordFreqOfLeadingDigitArrPercentages = [];
//   for (let i = 0; i < 10; i++) {
//     if (i !== 0) {
//       benfordFreqOfLeadingDigitArrPercentages.push(
//         Math.log10(1 / i + 1).toFixed(4)
//       );
//     } else benfordFreqOfLeadingDigitArrPercentages.push(0);
//   }

//   const benfordLine = {
//     x: [1, 2, 3, 4, 5, 6, 7, 8, 9],
//     y: benfordFreqOfLeadingDigitArrPercentages.slice(1),
//     type: "scatter",
//     line: { color: "red" },
//     name: "Benford Prediction by Leading Digit (%)",
//   };

//   // Convert outputArr elements into decimals in yValuesObserved array
//   //   const yValuesObserved = outputArr.map((elem) => (elem / 10000).toFixed(4));
//   // NEW, UNUSED
//   //   const yArrEvenDist = new Array(9).fill(1 / 9);
//   //   const yValuesEvenDist = yArrEvenDist.map((elem) => elem.toFixed(4));
//   //   console.log(yValuesEvenDist);

//   const observedBars = {
//     x: [1, 2, 3, 4, 5, 6, 7, 8, 9],
//     y: [0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111],
//     // y: yValuesObserved,
//     type: "bar",
//     marker: {
//       color: "rgb(158,202,225)",
//       opacity: 0.6,
//       line: {
//         color: "rgb(8,48,107)",
//         width: 1.5,
//       },
//     },
//     name: "Perfectly Even Distribution by Leading Digit (%)",
//   };

//   const dataToChart = [benfordLine, observedBars];
//   const layout = {
//     title:
//       "Benford’s Law Predictions vs. Perfectly Even Distribution of Leading Digits",
//     xaxis: {
//       title: "Leading 1st Digit",
//       titlefont: {
//         size: 12,
//         color: "rgb(107, 107, 107)",
//       },
//     },
//     yaxis: {
//       title: {
//         text: "Frequency distribution by lead digit (Sum total = 100%)",
//         padding: {
//           left: 1000,
//         },
//       },
//       titlefont: {
//         size: 12,
//         color: "rgb(107, 107, 107)",
//       },
//     },
//   };

//   const TESTER = document.getElementById("chartHanger");
//   Plotly.newPlot(TESTER, dataToChart, layout);
// };

// export default chartBenfordResults;
