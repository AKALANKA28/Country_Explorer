import React, { createContext, useState, useEffect, useContext } from "react";
import {
  fetchAllCountries,
  fetchCountryByName,
  fetchCountriesByRegion,
  fetchCountriesByLanguage,
} from "../services/api";
import { AuthContext } from "./AuthContext";

export const CountryContext = createContext();

export const CountryProvider = ({ children }) => {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [favorites, setFavorites] = useState([]);
  const { currentUser } = useContext(AuthContext);

  // Load all countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true);
        const data = await fetchAllCountries();
        setCountries(data);
        setFilteredCountries(data);
      } catch (err) {
        setError("Failed to fetch countries. Please try again later.");
        console.error("Error fetching countries:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);
  // Load favorites from localStorage
  useEffect(() => {
    if (currentUser) {
      // Use user-specific key for favorites
      const favoriteKey = `favorites_${currentUser.uid}`;
      const storedFavorites = localStorage.getItem(favoriteKey);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } else {
      // Clear favorites when no user is logged in
      setFavorites([]);
    }
  }, [currentUser]);
  // Filter countries based on search term and selected region
  useEffect(() => {
    // Guard against undefined countries
    if (!countries || !Array.isArray(countries)) {
      setFilteredCountries([]);
      return;
    }

    let results = countries;

    if (searchTerm) {
      results = results.filter(
        (country) =>
          country &&
          country.name &&
          country.name.common &&
          country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRegion) {
      results = results.filter(
        (country) =>
          country &&
          country.region &&
          country.region.toLowerCase() === selectedRegion.toLowerCase()
      );
    }

    setFilteredCountries(results);
  }, [searchTerm, selectedRegion, countries]);
  // Add or remove country from favorites
  const toggleFavorite = (countryCode) => {
    if (!currentUser) return;

    const newFavorites = favorites.includes(countryCode)
      ? favorites.filter((code) => code !== countryCode)
      : [...favorites, countryCode];

    setFavorites(newFavorites);
    // Use user-specific key for storing favorites
    const favoriteKey = `favorites_${currentUser.uid}`;
    localStorage.setItem(favoriteKey, JSON.stringify(newFavorites));
  };

  // Check if a country is in favorites
  const isFavorite = (countryCode) => {
    return favorites.includes(countryCode);
  };
  // Search countries by name
  const searchCountries = async (query, includeLanguage = false) => {
    if (!query || !query.trim()) {
      if (Array.isArray(countries)) {
        setFilteredCountries(countries);
      } else {
        setFilteredCountries([]);
      }
      setSearchTerm("");
      return;
    }

    setLoading(true);
    setSearchTerm(query);
    setError(null);

    try {
      // Start with name search
      let nameResults = [];
      try {
        const data = await fetchCountryByName(query);
        // Ensure we got valid data
        nameResults = Array.isArray(data) ? data : [];
      } catch (err) {
        // Handle not found or other API errors
        if (err && err.message === "Not Found") {
          // Fallback to client-side filtering for name
          if (Array.isArray(countries)) {
            nameResults = countries.filter(
              (country) =>
                country &&
                country.name &&
                ((country.name.common &&
                  country.name.common
                    .toLowerCase()
                    .includes(query.toLowerCase())) ||
                  (country.name.official &&
                    country.name.official
                      .toLowerCase()
                      .includes(query.toLowerCase())))
            );
          } else {
            nameResults = [];
          }
        } else {
          console.error("Error searching by name:", err);
          nameResults = [];
        }
      } // If query is long enough and we want language search
      if (includeLanguage && query.trim().length >= 3) {
        try {
          const langResults = await fetchCountriesByLanguage(query);

          // Make sure both nameResults and langResults are arrays before processing
          if (
            Array.isArray(nameResults) &&
            Array.isArray(langResults) &&
            langResults.length > 0
          ) {
            // Combine results, avoiding duplicates
            const allCodes = new Set(
              nameResults
                .map((country) => country && country.cca3)
                .filter(Boolean)
            );
            langResults.forEach((country) => {
              if (country && country.cca3 && !allCodes.has(country.cca3)) {
                allCodes.add(country.cca3);
                nameResults.push(country);
              }
            });
          }
        } catch (langErr) {
          console.error("Error searching by language:", langErr);

          // Make sure countries is an array before filtering
          if (Array.isArray(countries)) {
            // Fallback to client-side language filtering
            const clientLangResults = countries.filter((country) => {
              if (!country || !country.languages) return false;
              return Object.values(country.languages).some((lang) =>
                lang.toLowerCase().includes(query.toLowerCase())
              );
            });

            // Make sure both arrays exist before combining
            if (
              Array.isArray(nameResults) &&
              Array.isArray(clientLangResults) &&
              clientLangResults.length > 0
            ) {
              // Add client-side language matches that aren't already in nameResults
              const allCodes = new Set(
                nameResults
                  .map((country) => country && country.cca3)
                  .filter(Boolean)
              );
              clientLangResults.forEach((country) => {
                if (country && country.cca3 && !allCodes.has(country.cca3)) {
                  nameResults.push(country);
                }
              });
            }
          }
        }
      } // Update filtered countries with combined results, ensuring nameResults is an array
      if (Array.isArray(nameResults)) {
        setFilteredCountries(nameResults);

        if (nameResults.length === 0) {
          setError("No countries found matching your search.");
        }
      } else {
        setFilteredCountries([]);
        setError("Error processing search results.");
      }
    } catch (err) {
      console.error("Error in combined search:", err);
      setError("Error searching countries. Please try again.");
      setFilteredCountries([]);
    } finally {
      setLoading(false);
    }
  };
  // No need for separate filterByLanguage function as it's incorporated above
  const filterByLanguage = () => {}; // Keep empty function to avoid breaking existing code

  // Filter countries by region
  const filterByRegion = async (region) => {
    setSelectedRegion(region);

    if (!region) {
      if (Array.isArray(countries)) {
        setFilteredCountries(countries);
      } else {
        setFilteredCountries([]);
      }
      return;
    }

    try {
      setLoading(true);
      const data = await fetchCountriesByRegion(region);
      // Ensure we got valid data
      setFilteredCountries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error filtering countries. Please try again.");
      console.error("Error filtering countries:", err);
      setFilteredCountries([]);
    } finally {
      setLoading(false);
    }
  };
  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRegion("");
    if (Array.isArray(countries)) {
      setFilteredCountries(countries);
    } else {
      setFilteredCountries([]);
    }
  };
  const getFavoriteCountries = () => {
    if (!countries || !Array.isArray(countries)) {
      return [];
    }
    return countries.filter(
      (country) => country && country.cca3 && favorites.includes(country.cca3)
    );
  };

  const value = {
    countries,
    filteredCountries,
    loading,
    error,
    searchTerm,
    selectedRegion,
    favorites,
    searchCountries,
    filterByRegion,
    resetFilters,
    toggleFavorite,
    filterByLanguage,
    isFavorite,
    getFavoriteCountries,
  };

  return (
    <CountryContext.Provider value={value}>{children}</CountryContext.Provider>
  );
};
