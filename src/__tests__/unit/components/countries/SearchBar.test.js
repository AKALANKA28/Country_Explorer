import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CountryContext } from "../../../../context/CountryContext";
import SearchBar from "../../../../components/countries/SearchBar";

const mockContextValue = {
  searchCountries: jest.fn(),
  searchTerm: "",
};

describe("SearchBar component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("renders search input correctly", () => {
    render(
      <CountryContext.Provider value={mockContextValue}>
        <SearchBar />
      </CountryContext.Provider>
    );

    // Check if search input is rendered
    const searchInput = screen.getByPlaceholderText(
      /search by country name or language.../i
    );
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("type", "text");
  });

  test("displays the correct input value based on context", () => {
    const contextWithValue = {
      ...mockContextValue,
      searchTerm: "test query", // Using searchTerm
    };

    render(
      <CountryContext.Provider value={contextWithValue}>
        <SearchBar />
      </CountryContext.Provider>
    ); // In your component, you initialize inputValue state with searchTerm
    // So it should have the value from context
    const searchInput = screen.getByPlaceholderText(
      /search by country name or language.../i
    );
    expect(searchInput).toHaveValue("test query");
  });
});
