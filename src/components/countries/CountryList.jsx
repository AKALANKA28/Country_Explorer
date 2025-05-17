import React, { useContext, useMemo } from "react";
import { CountryContext } from "../../context/CountryContext";
import CountryRow from "./CountryRow"; // Make sure this import is correct

const CountryList = () => {
  const { filteredCountries, loading, error } = useContext(CountryContext);

  // Sort countries by name in ascending order
  const sortedCountries = useMemo(() => {
    if (!filteredCountries) return [];
    return [...filteredCountries].sort((a, b) =>
      a.name.common.localeCompare(b.name.common)
    );
  }, [filteredCountries]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen-content">
        <div
          className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"
          style={{ borderTopColor: "#38B2AC" }}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (sortedCountries.length === 0) {
    return (
      <div
        className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">No countries found!</strong>
        <span className="block sm:inline">
          {" "}
          Try adjusting your search criteria.
        </span>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Proper table structure with header and body */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr className="py-4 px-6 font-medium text-gray-600">
            <th className="w-12 p-2"></th> {/* Flag column */}
            <th className="flex-1 min-w-[120px] p-2 text-left">Country</th>
            <th className="flex-1 min-w-[120px] hidden sm:table-cell p-2 text-left">
              Capital
            </th>
            <th className="flex-1 min-w-[100px] hidden md:table-cell p-2 text-left">
              Region
            </th>
            <th className="flex-1 min-w-[120px] hidden lg:table-cell p-2 text-left">
              Population
            </th>
            <th className="w-12 p-2"></th> {/* Favorites column */}
          </tr>
        </thead>
        <tbody>
          {sortedCountries.map((country) => (
            <tr key={country.cca3} className="hover:bg-gray-50">
              <CountryRow country={country} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CountryList;
