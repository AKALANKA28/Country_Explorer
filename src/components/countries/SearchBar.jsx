import React, { useContext, useState, useEffect } from "react";
import { CountryContext } from "../../context/CountryContext";

const SearchBar = () => {
  const { searchCountries, filterByLanguage, searchTerm } =
    useContext(CountryContext);
  const [inputValue, setInputValue] = useState(searchTerm);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  useEffect(() => {
    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [debounceTimeout]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Clear any existing timeout to implement debouncing
    if (debounceTimeout) clearTimeout(debounceTimeout);

    // Set a new timeout
    const timeout = setTimeout(() => {
      if (!value.trim()) {
        // If search is empty, reset to all countries
        searchCountries("", true);
        return;
      }

      // For non-empty search, perform both search types
      searchCountries(value, true); // true flag indicates we're doing a combined search
    }, 300); // 300ms debounce delay

    setDebounceTimeout(timeout);
  };

  return (
    <div className="w-full md:w-96">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full bg-white border border-gray-300 hover:border-gray-400 pl-10 py-3 pr-3 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
          placeholder="Search by country name or language..."
          value={inputValue}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default SearchBar;
