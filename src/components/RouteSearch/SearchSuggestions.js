import React from 'react';
import './SearchSuggestions.css';

const SearchSuggestions = (props) => {

    const searchResultsClass = "results-pane";
    const searchResultsClassHidden = ["results-pane hidden"];

    return (
        <div className={props.visible ? searchResultsClass : searchResultsClassHidden}>
            {props.suggestions.map((el, index) => {
                return (
                    <div key={index}
                        className="suggestion-text"
                        onClick={(event) => props.doSearch(el.text, props.isStartSearchType)}>{el.text}</div>
                )
            })}
        </div>
    )
};

export default SearchSuggestions;