import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CountryContext } from "../../context/CountryContext";

// New color scheme
const COLORS = {
  primary: "#38B2AC", // Teal for regular countries
  favorite: "#805AD5", // Purple for favorites
  accent: "#4A5568", // Dark gray for text
};

const CountryRow = ({ country }) => {
  const { currentUser } = useContext(AuthContext);
  const { toggleFavorite, isFavorite } = useContext(CountryContext);

  const formatPopulation = (population) => {
    return population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(country.cca3);
  }; // We're wrapping all table cells in a fragment
  return (
    <>
      {/* Flag */}
      <td className="p-2">
        <div className="w-12 h-8 overflow-hidden rounded shadow flex-shrink-0">
          <Link to={`/country/${country.cca3}`}>
            <img
              src={country.flags.svg}
              alt={`Flag of ${country.name.common}`}
              className="w-full h-full object-cover"
            />
          </Link>
        </div>
      </td>{" "}
      {/* Country Name */}
      <td className="p-2">
        <Link
          to={`/country/${country.cca3}`}
          className="font-medium text-gray-800"
        >
          {country.name.common}
        </Link>
      </td>
      {/* Capital */}
      <td className="p-2 text-gray-600">
        {country.capital && country.capital.length > 0
          ? country.capital.join(", ")
          : "N/A"}
      </td>
      {/* Region */}
      <td className="p-2 text-gray-600">{country.region || "N/A"}</td>
      {/* Population */}
      <td className="p-2 text-gray-600">
        {formatPopulation(country.population)}
      </td>
      {/* Favorite button */}
      <td className="p-2">
        {currentUser && (
          <button
            onClick={handleFavoriteClick}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
            aria-label={
              isFavorite(country.cca3)
                ? "Remove from favorites"
                : "Add to favorites"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill={isFavorite(country.cca3) ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              color={isFavorite(country.cca3) ? COLORS.favorite : COLORS.accent}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        )}
      </td>
    </>
  );
};

export default CountryRow;
