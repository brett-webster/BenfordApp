# BenfordApp


<p align="center">
  <img width="300" src="/src/client/BenfordAppLogo.png">
</p>


### Summary
BenfordApp accesses the SEC’s EDGAR financial data repository via its JSON API in order to screen companies’ public financial statements for potential error or fraud.  It does so by parsing relevant financial data for a user-designated publicly traded US company.  The app applies the input parameters (company, date range) in order to extract data and then runs and displays an analysis assessing the data’s adherence to [Benford’s Law](https://mathworld.wolfram.com/BenfordsLaw.html) (expected frequency of leading digits).

The chart below graphically summarizes Benford’s Law distribution expectation of leading single digit frequency (adheres to power law / red line vs. a perfectly even distribution / blue bars).  BenfordApp includes authentication, log-in flow and database integrity to protect user PII while allowing for permanent data storage of previously analyzed companies.  Note:  BenfordApp is intentionally modularized so that it can be easily repurposed to evaluate other financial and non-financial data for conformity (or lack thereof) with the “law of leading digits.”

I wrote a proto version of BenfordApp about 10 years ago in R that originally parsed the SEC’s HTML DOM of relevant financial statements from start to finish; the current version uses React/Node.js/Javascript + npm libraries to upgrade the original code with an improved GUI that leverages the SEC’s publicly available API for the initial raw data and avoids rate-limiting.  


<br> </br>
<p align="center">
  <img width="1200" src="/src/client/BenfordvsEvenDistributionChart.png">
</p>
<br> </br>


### About the SEC & EDGAR
The [SEC](https://www.sec.gov/about/what-we-do) is the Securities and Exchange Commission, the US federal agency tasked with protecting investors, maintaining efficient and orderly stock and bond markets and facilitating capital formation.  In the US, all companies with publicly traded stocks are required to report their financial results on a quarterly and annual basis.  [EDGAR](https://www.sec.gov/edgar/searchedgar/companysearch) ( Electronic Data Gathering, Analysis, and Retrieval system) is the online database repository maintained by the SEC where companies regularly upload their financial information and investors and other interested parties can easily access this financial data (including recently via API).


### Applications
Applications of a more sophisticated version of this project include:  error/fraud testing for internal corporate accountants, external auditors and others in the financial services/investment industry such as individual and professional investors.  

This tool is most powerful when used in tandem with a battery of other forensic accounting/auditing techniques (e.g. [Dechow F-Score](https://www.thecaq.org/wp-content/uploads/2018/03/Dechow-et-al-2011-Contemporary_Accounting_Research.pdf)). 
Its release is also timely:  [Accounting-Fraud Indicator Signals Coming Economic Trouble - A tool to identify corporate earnings manipulation finds the most risk in over 40 years - WSJ - Mar-2023](https://www.wsj.com/articles/accounting-fraud-indicator-signals-coming-economic-trouble-506568a0)


### Tech stack
- React.js
- JavaScript
- Node.js
- Express.js
- Webpack
- PostgreSQL


### Key Methods/Libraries used
JSON API, JSDOM, Plotly, fs.readFile/writeFile, CRUD functionality, Promise.all, async/await, React Router/Hooks (useState, useEffect, useContext, useNavigate, useLocation), regex, data frames, client & server-side caching (node-localStorage), statistical analysis, axios, node-fetch, OAuth 2.0 (in progress)


### Potential future improvements
- Enterprise-grade caching solution for faster performance
- Optimize Node.js memory allocation during JSDOM HTML node creation & parsing process (of financial statement text)
- 2FA with one-time passcode via SMS from Twilio

