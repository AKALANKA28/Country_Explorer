import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CountryContext } from '../../context/CountryContext';

const CountryCard = ({ country }) => {
  const { currentUser } = useContext(AuthContext);
  const { toggleFavorite, isFavorite } = useContext(CountryContext);
  
  const formatPopulation = (population) => {
    return population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(country.cca3);
  };

  return (
    <div className="country-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <Link to={`/country/${country.cca3}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={country.flags.svg} 
            alt={`Flag of ${country.name.common}`}
            className="w-full h-full object-cover"
          />
          {currentUser && (
            <button
              onClick={handleFavoriteClick}
              className="absolute top-2 right-2 p-2 bg-white bg-opacity-70 rounded-full hover:bg-opacity-100 transition-all duration-200"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill={isFavorite(country.cca3) ? "currentColor" : "none"} 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth="2"
                color={isFavorite(country.cca3) ? "#f59e0b" : "#4b5563"}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                />
              </svg>
            </button>
          )}
        </div>
        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{country.name.common}</h2>
          <div className="space-y-1 text-gray-700">
            <p className="flex items-center">
              <span className="font-semibold mr-2">Population:</span> {formatPopulation(country.population)}
            </p>
            <p className="flex items-center">
              <span className="font-semibold mr-2">Region:</span> {country.region}
            </p>
            <p className="flex items-center">
              <span className="font-semibold mr-2">Capital:</span> {country.capital ? country.capital.join(', ') : 'N/A'}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CountryCard;