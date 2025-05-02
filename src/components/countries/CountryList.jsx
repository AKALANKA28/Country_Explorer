import React, { useContext } from 'react';
import { CountryContext } from '../../context/CountryContext';
import CountryCard from './CountryCard';

const CountryList = () => {
  const { filteredCountries, loading, error } = useContext(CountryContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen-content">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (filteredCountries.length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">No countries found!</strong>
        <span className="block sm:inline"> Try adjusting your search criteria.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {filteredCountries.map(country => (
        <CountryCard key={country.cca3} country={country} />
      ))}
    </div>
  );
};

export default CountryList;