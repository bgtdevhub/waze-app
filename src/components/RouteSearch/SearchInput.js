import React from 'react';
import './SearchInput.css';

const SearchInput = (props) => {

  const inputChangedHandler = (props, event) => {
    const searchTerm = event.target.value;
    props.showSuggestion(searchTerm, props.isStartSearchType);
  }

  return (
    <div>
      <input type="text" 
        className="search-input"
        placeholder={props.placeholder}
        onChange={(event) => {inputChangedHandler(props, event)}}
        value={props.searchTerm}
      />
      <div className="underline"></div>
    </div>
  )
}

export default SearchInput;
