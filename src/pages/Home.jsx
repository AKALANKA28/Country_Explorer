import React, { useState } from "react";
import SearchBar from "../components/countries/SearchBar";
import FilterOptions from "../components/countries/FilterOptions";
import CountryList from "../components/countries/CountryList";
import CountryGrid from "../components/countries/CountryGrid";
import WorldMap from "../components/countries/WorldMap";

const Home = () => {
  const [viewMode, setViewMode] = useState("map"); // 'map', 'grid', or 'list'

  // Define colors to match your new color scheme
  const COLORS = {
    primary: '#38B2AC', // Teal for regular countries
    favorite: '#805AD5', // Purple for favorites
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <SearchBar />
        <div className="flex items-center gap-4">
          <div className="flex border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === "map"
                  ? "text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              style={{ backgroundColor: viewMode === "map" ? COLORS.primary : "" }}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Map
              </span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === "grid"
                  ? "text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              style={{ backgroundColor: viewMode === "grid" ? COLORS.primary : "" }}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grid
              </span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === "list"
                  ? "text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              style={{ backgroundColor: viewMode === "list" ? COLORS.primary : "" }}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List
              </span>
            </button>
          </div>
          <FilterOptions />
        </div>
      </div>

      {viewMode === "map" ? (
        <WorldMap />
      ) : viewMode === "grid" ? (
        <CountryGrid />
      ) : (
        <CountryList />
      )}
    </div>
  );
};

export default Home;