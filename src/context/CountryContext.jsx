import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchAllCountries, fetchCountryByName, fetchCountriesByRegion } from '../services/api';
import { AuthContext } from './AuthContext';

export const CountryContext = createContext();

export const CountryProvider = ({ children }) => {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
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
        setError('Failed to fetch countries. Please try again later.');
        console.error('Error fetching countries:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    if (currentUser) {
      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    }
  }, [currentUser]);

  // Filter countries based on search term and selected region
  useEffect(() => {
    let results = countries;

    if (searchTerm) {
      results = results.filter(country => 
        country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRegion) {
      results = results.filter(country => 
        country.region.toLowerCase() === selectedRegion.toLowerCase()
      );
    }

    setFilteredCountries(results);
  }, [searchTerm, selectedRegion, countries]);

  // Add or remove country from favorites
  const toggleFavorite = (countryCode) => {
    if (!currentUser) return;

    const newFavorites = favorites.includes(countryCode)
      ? favorites.filter(code => code !== countryCode)
      : [...favorites, countryCode];

    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  // Check if a country is in favorites
  const isFavorite = (countryCode) => {
    return favorites.includes(countryCode);
  };

  // Search countries by name
  const searchCountries = async (name) => {
    if (!name.trim()) {
      setFilteredCountries(countries);
      setSearchTerm('');
      return;
    }

    try {
      setLoading(true);
      setSearchTerm(name);
      const data = await fetchCountryByName(name);
      setFilteredCountries(data);
    } catch (err) {
      if (err.message === 'Not Found') {
        setFilteredCountries([]);
      } else {
        setError('Error searching countries. Please try again.');
        console.error('Error searching countries:', err);
      }
    } finally {
      setLoading(false);
    }
  };

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
      setError('Error filtering countries. Please try again.');
      console.error('Error filtering countries:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRegion('');
    setFilteredCountries(countries);
  };

  const getFavoriteCountries = () => {
    return countries.filter(country => favorites.includes(country.cca3));
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
    isFavorite,
    getFavoriteCountries
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
};