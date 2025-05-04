import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CountryContext } from '../context/CountryContext';
import CountryRow from '../components/countries/CountryRow';
import CountryCard from '../components/countries/CountryCard';
import WorldMap from '../components/countries/WorldMap';

// Define colors to match your new color scheme
const COLORS = {
  primary: '#38B2AC', // Teal for regular countries
  favorite: '#805AD5', // Purple for favorites
};

const FavoritesPage = () => {
  const { getFavoriteCountries, loading } = useContext(CountryContext);
  const [viewMode, setViewMode] = useState('map'); // 'map', 'grid', or 'list'
  const favoriteCountries = getFavoriteCountries();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen-content">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"
             style={{ borderTopColor: COLORS.primary }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-3xl font-bold text-gray-800">Your Favorite Countries</h1>
        <div className="flex mt-4 md:mt-0 gap-4">
          <div className="flex border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-2 text-sm font-medium flex items-center ${viewMode === 'map' ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              style={{ backgroundColor: viewMode === 'map' ? COLORS.primary : '' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Map
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium flex items-center ${viewMode === 'grid' ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              style={{ backgroundColor: viewMode === 'grid' ? COLORS.primary : '' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium flex items-center ${viewMode === 'list' ? 'text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              style={{ backgroundColor: viewMode === 'list' ? COLORS.primary : '' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List
            </button>
          </div>
      
        </div>
      </div>

      {favoriteCountries.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-700 mt-4">No favorite countries yet</h2>
          <p className="text-gray-500 mt-2">
            Start exploring and add countries to your favorites list.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: COLORS.primary, "--tw-ring-color": COLORS.primary }}
          >
            Explore Countries
          </Link>
        </div>
      ) : (
        viewMode === 'map' ? (
          <WorldMap favoritesOnly={true} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {favoriteCountries.map(country => (
              <CountryCard key={country.cca3} country={country} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Table header */}
            <div className="bg-gray-50 border-b border-gray-200 py-4 px-6 flex items-center font-medium text-gray-600">
              <div className="w-12"></div> {/* Flag column */}
              <div className="flex-1 min-w-[120px]">Country</div>
              <div className="flex-1 min-w-[120px] hidden sm:block">Capital</div>
              <div className="flex-1 min-w-[100px] hidden md:block">Region</div>
              <div className="flex-1 min-w-[120px] hidden lg:block">Population</div>
              <div className="w-12"></div> {/* Favorites column */}
            </div>
            
            {/* Table body */}
            <div className="divide-y divide-gray-200">
              {favoriteCountries.map(country => (
                <CountryRow key={country.cca3} country={country} />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default FavoritesPage;