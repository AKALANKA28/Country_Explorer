const BASE_URL = 'https://restcountries.com/v3.1';

// Fetch all countries (Endpoint 1)
export const fetchAllCountries = async () => {
  try {
    const response = await fetch(`${BASE_URL}/all`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all countries:', error);
    throw error;
  }
};

// Fetch country by name (Endpoint 2)
export const fetchCountryByName = async (name) => {
  try {
    const response = await fetch(`${BASE_URL}/name/${name}`);
    if (!response.ok) {
      throw new Error(response.status === 404 ? 'Not Found' : `HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching country by name (${name}):`, error);
    throw error;
  }
};

// Fetch countries by region (Endpoint 3)
export const fetchCountriesByRegion = async (region) => {
  try {
    const response = await fetch(`${BASE_URL}/region/${region}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching countries by region (${region}):`, error);
    throw error;
  }
};

// Fetch country by code (Endpoint 4)
export const fetchCountryByCode = async (code) => {
  try {
    const response = await fetch(`${BASE_URL}/alpha/${code}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error(`Error fetching country by code (${code}):`, error);
    throw error;
  }
};