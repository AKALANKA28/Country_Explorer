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
      const storedFavorites = localStorage.getItem("favorites");
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    }
  }, [currentUser]);

  // Filter countries based on search term and selected region
  useEffect(() => {
    let results = countries;

    if (searchTerm) {
      results = results.filter((country) =>
        country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRegion) {
      results = results.filter(
        (country) =>
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
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  // Check if a country is in favorites
  const isFavorite = (countryCode) => {
    return favorites.includes(countryCode);
  };

  // Search countries by name
  const searchCountries = async (query, includeLanguage = false) => {
    if (!query.trim()) {
      setFilteredCountries(countries);
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
        nameResults = data;
      } catch (err) {
        // Handle not found or other API errors
        if (err.message === "Not Found") {
          // Fallback to client-side filtering for name
          nameResults = countries.filter(
            (country) =>
              country.name.common.toLowerCase().includes(query.toLowerCase()) ||
              country.name.official.toLowerCase().includes(query.toLowerCase())
          );
        } else {
          console.error("Error searching by name:", err);
        }
      }

      // If query is long enough and we want language search
      if (includeLanguage && query.trim().length >= 3) {
        try {
          const langResults = await fetchCountriesByLanguage(query);

          // Combine results, avoiding duplicates
          const allCodes = new Set(nameResults.map((country) => country.cca3));
          langResults.forEach((country) => {
            if (!allCodes.has(country.cca3)) {
              allCodes.add(country.cca3);
              nameResults.push(country);
            }
          });
        } catch (langErr) {
          console.error("Error searching by language:", langErr);

          // Fallback to client-side language filtering
          const clientLangResults = countries.filter((country) => {
            if (!country.languages) return false;
            return Object.values(country.languages).some((lang) =>
              lang.toLowerCase().includes(query.toLowerCase())
            );
          });

          // Add client-side language matches that aren't already in nameResults
          const allCodes = new Set(nameResults.map((country) => country.cca3));
          clientLangResults.forEach((country) => {
            if (!allCodes.has(country.cca3)) {
              nameResults.push(country);
            }
          });
        }
      }

      // Update filtered countries with combined results
      setFilteredCountries(nameResults);

      if (nameResults.length === 0) {
        setError("No countries found matching your search.");
      }
    } catch (err) {
      console.error("Error in combined search:", err);
      setError("Error searching countries. Please try again.");
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
      setFilteredCountries(countries);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchCountriesByRegion(region);
      setFilteredCountries(data);
    } catch (err) {
      setError("Error filtering countries. Please try again.");
      console.error("Error filtering countries:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRegion("");
    setFilteredCountries(countries);
  };

  const getFavoriteCountries = () => {
    return countries.filter((country) => favorites.includes(country.cca3));
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
