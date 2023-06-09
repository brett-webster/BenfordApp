import React, { useEffect } from "react";

function CompanyInputAutocomplete({
  chartDisplayBoolean,
  companyListArr,
  setAutocompleteState,
  autocompleteState,
}) {
  // Passing down props:  flag for clearing charting (triggers clear of company name field), array of company names used for auto-complete & setAutocompleteState state setter & associated variable (setting it here, but accessing it in direct parent to send full input bundle to server)

  // Reset company name field value to "" on each new render
  useEffect(() => {
    setAutocompleteState({ ...autocompleteState, userInput: "" });
  }, []);
  // Reset company name field value to "" when CLEAR CHART button clicked
  useEffect(() => {
    setAutocompleteState({ ...autocompleteState, userInput: "" });
  }, [chartDisplayBoolean]);

  // ------------

  const charChangeHandler = (event) => {
    const suggestions = companyListArr;
    const userInput = event.target.value;

    // Filter our suggestions that don't contain the user's input -- partial matches yield true
    const filteredSuggestions = suggestions.filter(
      (suggestion) => suggestion.indexOf(userInput.toUpperCase()) > -1
    );

    setAutocompleteState({
      ...autocompleteState,
      activeSuggestion: 0,
      filteredSuggestions,
      showSuggestions: true,
      userInput: event.target.value,
    });
  };

  const onClick = (event) => {
    setAutocompleteState({
      ...autocompleteState,
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: event.target.innerText,
    });
  };

  // ADDED HOVER TO AVOID 2 SIMULTANEOUSLY HIGHLIGHTED NAMES
  const onHover = (index) => {
    setAutocompleteState({
      ...autocompleteState,
      activeSuggestion: index,
    });
  };

  const onKeyDown = (event) => {
    const { activeSuggestion, filteredSuggestions } = autocompleteState;

    // User pressed the enter key -- enter key autocompletes user selection (but still needs to hit 'SUBMIT' button) -- using ASCII keyCodes here
    if (event.keyCode === 13) {
      setAutocompleteState({
        ...autocompleteState,
        activeSuggestion: 0,
        showSuggestions: false,
        userInput: filteredSuggestions[activeSuggestion],
      });
    }
    // User pressed the up arrow -- return & do nothing when user presses up key @ position 0, otherwise move up one
    else if (event.keyCode === 38) {
      if (activeSuggestion === 0) {
        return;
      }
      setAutocompleteState({
        ...autocompleteState,
        activeSuggestion: activeSuggestion - 1,
      });
    }
    // User pressed the down arrow -- return & do nothing when user presses down key @ lowest position, otherwise move down one
    else if (event.keyCode === 40) {
      if (activeSuggestion + 1 === filteredSuggestions.length) {
        // CORRECTED INITIAL ERROR HERE
        return;
      }
      setAutocompleteState({
        ...autocompleteState,
        activeSuggestion: activeSuggestion + 1,
      });
    }
  };

  const { activeSuggestion, filteredSuggestions, showSuggestions, userInput } =
    autocompleteState; // destructure state object

  // Sub-component suggestionsListComponent is created & rendered below beneath <input> tag w/in return statement
  let suggestionsListComponent;

  if (showSuggestions && userInput) {
    // only display if flag set = TRUE & user has typed something in
    if (filteredSuggestions.length) {
      // User input has at least one match -- create a bundle w/ an unordered list items using map() method & return for display
      suggestionsListComponent = (
        <ul className="autoCompleteSuggestions">
          {filteredSuggestions.map((suggestion, index) => {
            let className;

            // Mark active suggestion with a class for styling
            if (index === activeSuggestion) {
              className = "activeSuggestion";
            }

            return (
              <li
                className={className}
                key={suggestion}
                onClick={onClick}
                index={index}
                onMouseEnter={onHover}
              >
                {suggestion}
              </li>
            );
          })}
        </ul>
      );
      // User input has no matches
    } else {
      suggestionsListComponent = (
        <div className="noSuggestions">
          <em>No suggestions available, please try another company name...</em>
        </div>
      );
    }
  }

  return (
    <>
      <input
        type="text"
        name="company"
        placeholder="* Company name *"
        value={userInput}
        onChange={charChangeHandler}
        onKeyDown={onKeyDown}
        required
        id="companyNameBox"
        style={{ fontSize: "15px", fontFamily: "Arial, sans-serif" }}
      ></input>
      {suggestionsListComponent}
    </>
  );
}

export default CompanyInputAutocomplete;
