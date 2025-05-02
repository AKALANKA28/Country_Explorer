import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCountryByCode } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { CountryContext } from '../../context/CountryContext';

const CountryDetail = () => {
  const { code } = useParams();
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { toggleFavorite, isFavorite } = useContext(CountryContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchCountryByCode(code);
        setCountry(data);
      } catch (err) {
        setError('Failed to fetch country details. Please try again later.');
        console.error('Error fetching country details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code]);

  const formatPopulation = (population) => {
    return population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleFavoriteClick = () => {
    toggleFavorite(country.cca3);
  };

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

  if (!country) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Country not found!</strong>
        <span className="block sm:inline"> The requested country could not be found.</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden my-8">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <div className="relative h-64 md:h-full">
            <img
              src={country.flags.svg}
              alt={`Flag of ${country.name.common}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="md:w-1/2 p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{country.name.common}</h1>
            {currentUser && (
              <button
                onClick={handleFavoriteClick}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 my-6">
            <div>
              <p className="text-gray-700">
                <span className="font-semibold">Native Name: </span>
                {Object.values(country.name.nativeName || {})[0]?.common || country.name.common}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Population: </span>
                {formatPopulation(country.population)}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Region: </span>
                {country.region}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Sub Region: </span>
                {country.subregion || 'N/A'}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Capital: </span>
                {country.capital ? country.capital.join(', ') : 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-gray-700">
                <span className="font-semibold">Top Level Domain: </span>
                {country.tld ? country.tld.join(', ') : 'N/A'}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Currencies: </span>
                {country.currencies
                  ? Object.values(country.currencies)
                      .map(currency => `${currency.name} (${currency.symbol})`)
                      .join(', ')
                  : 'N/A'}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Languages: </span>
                {country.languages
                  ? Object.values(country.languages).join(', ')
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Border Countries:</h2>
            <div className="flex flex-wrap gap-2">
              {country.borders && country.borders.length > 0 ? (
                country.borders.map(border => (
                  <Link
                    key={border}
                    to={`/country/${border}`}
                    className="px-4 py-1 bg-white shadow hover:shadow-md text-gray-700 text-sm font-medium rounded"
                  >
                    {border}
                  </Link>
                ))
              ) : (
                <span className="text-gray-500">No border countries</span>
              )}
            </div>
          </div>

          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to All Countries
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryDetail;