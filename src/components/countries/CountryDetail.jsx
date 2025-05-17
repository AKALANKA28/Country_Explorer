import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCountryByCode } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { CountryContext } from "../../context/CountryContext";
import CountryLocationMap from "./CountryLocationMap";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Color scheme
const COLORS = {
  primary: "#006A71", // Teal
  favorite: "#fff", 
  accent: "#4A5568", // Dark gray
  secondary: "#6A9C89", // Orange
  tertiary: "#48A6A7", // Blue
  quaternary: "#C1D8C3", // Green
  light: "#F7FAFC", // Very light gray
  border: "#E2E8F0", // Light gray
};

// Chart colors
const CHART_COLORS = [
  "#205781",
  "#4F959D",
  "#98D2C0",
  "#6A9C89",
  "#48BB78",
  "#F6AD55",
];

const CountryDetail = () => {
  const { code } = useParams();
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { currentUser } = useContext(AuthContext);
  const { toggleFavorite, isFavorite, countries } = useContext(CountryContext);
  const [borderCountries, setBorderCountries] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchCountryByCode(code);
        setCountry(data);

        // Fetch border countries data
        if (data.borders && data.borders.length > 0) {
          const borders = countries.filter((c) =>
            data.borders.includes(c.cca3)
          );
          setBorderCountries(borders);
        }
      } catch (err) {
        setError("Failed to fetch country details. Please try again later.");
        console.error("Error fetching country details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code, countries]);

  const formatPopulation = (population) => {
    return population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleFavoriteClick = () => {
    toggleFavorite(country.cca3);
  };

  // Prepare data for population comparison chart
  const getPopulationChartData = () => {
    if (!country || !borderCountries.length) return [];

    const data = [{ name: country.name.common, value: country.population }];

    borderCountries.forEach((border) => {
      data.push({ name: border.name.common, value: border.population });
    });

    // Sort by population (descending)
    return data.sort((a, b) => b.value - a.value).slice(0, 6);
  };

  // Prepare data for area comparison chart
  const getAreaChartData = () => {
    if (!country || !borderCountries.length) return [];

    const data = [{ name: country.name.common, value: country.area }];

    borderCountries.forEach((border) => {
      if (border.area) {
        data.push({ name: border.name.common, value: border.area });
      }
    });

    // Sort by area (descending)
    return data.sort((a, b) => b.value - a.value).slice(0, 6);
  };

  // Prepare data for language pie chart
  const getLanguageData = () => {
    if (!country || !country.languages) return [];

    return Object.entries(country.languages).map(([code, name]) => ({
      name: name,
      value: 1,
    }));
  };

  // Format large numbers with appropriate suffixes
  const formatLargeNumber = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + "B";
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num;
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {formatPopulation(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen-content">
        <div
          className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-20 w-20"
          style={{ borderTopColor: COLORS.primary }}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline ml-2">{error}</span>
      </div>
    );
  }

  if (!country) {
    return (
      <div
        className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow"
        role="alert"
      >
        <strong className="font-bold">Country not found!</strong>
        <span className="block sm:inline ml-2">
          The requested country could not be found.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden my-6">
      <div className="relative">
        <div className="h-64 overflow-hidden bg-gray-100">
          {/* Full-width background with semi-transparent overlay */}
          <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm z-10"></div>

          {/* Country flag properly sized and positioned for background */}
          <img
            src={country.flags.svg}
            alt={`Flag of ${country.name.common}`}
            className="w-full h-full object-cover"
            style={{ objectPosition: "center" }}
          />

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-20"></div>

          {/* Back button positioned inside the banner at the top */}
          <div className="absolute top-4 left-4 z-30">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-black/30 hover:bg-black/40 border border-transparent text-sm font-medium rounded-md text-white backdrop-blur-sm transition-all duration-200 focus:outline-none"
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
              Back to Countries
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 p-6 flex justify-between items-end w-full z-30">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {country.name.common}
            </h1>
            <div className="flex items-center text-white/90">
              <span className="text-lg">{country.region}</span>
              {country.subregion && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-lg">{country.subregion}</span>
                </>
              )}
            </div>
          </div>

          {currentUser && (
            <button
              onClick={handleFavoriteClick}
              className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full transition-all duration-200 mr-4"
              aria-label={
                isFavorite(country.cca3)
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill={isFavorite(country.cca3) ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                color={isFavorite(country.cca3) ? COLORS.favorite : "white"}
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
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="px-6 flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? `border-${COLORS.primary} text-${COLORS.primary}`
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            style={{
              borderColor:
                activeTab === "overview" ? COLORS.primary : "transparent",
              color: activeTab === "overview" ? COLORS.primary : undefined,
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "statistics"
                ? `border-${COLORS.primary} text-${COLORS.primary}`
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            style={{
              borderColor:
                activeTab === "statistics" ? COLORS.primary : "transparent",
              color: activeTab === "statistics" ? COLORS.primary : undefined,
            }}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab("borders")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "borders"
                ? `border-${COLORS.primary} text-${COLORS.primary}`
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            style={{
              borderColor:
                activeTab === "borders" ? COLORS.primary : "transparent",
              color: activeTab === "borders" ? COLORS.primary : undefined,
            }}
          >
            Border Countries
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={country.flags.svg}
                    alt={`Flag of ${country.name.common}`}
                    className="w-full h-full "
                  />
                </div>
                {country.flags.alt && (
                  <p className="mt-2 text-sm text-gray-600 italic">
                    Flag description: {country.flags.alt}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Essential Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Official Name
                      </p>
                      <p className="mt-1">{country.name.official}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Native Name
                      </p>
                      <p className="mt-1">
                        {Object.values(country.name.nativeName || {})[0]
                          ?.common || country.name.common}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Capital
                      </p>
                      <p className="mt-1">
                        {country.capital ? country.capital.join(", ") : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Population
                      </p>
                      <p className="mt-1">
                        {formatPopulation(country.population)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Area</p>
                      <p className="mt-1">
                        {country.area
                          ? `${formatPopulation(country.area)} km²`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Additional Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Currencies
                      </p>
                      <div className="mt-1">
                        {country.currencies
                          ? Object.values(country.currencies).map(
                              (currency, index) => (
                                <div key={index} className="flex items-center">
                                  <span>{currency.name}</span>
                                  {currency.symbol && (
                                    <span className="ml-1 text-gray-500">
                                      ({currency.symbol})
                                    </span>
                                  )}
                                </div>
                              )
                            )
                          : "N/A"}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Languages
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {country.languages
                          ? Object.values(country.languages).map(
                              (language, index) => (
                                <span
                                  key={index}
                                  className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-sm"
                                >
                                  {language}
                                </span>
                              )
                            )
                          : "N/A"}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Top Level Domain
                      </p>
                      <p className="mt-1">
                        {country.tld ? country.tld.join(", ") : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Independence Status
                      </p>
                      <p className="mt-1">
                        {country.independent
                          ? "Independent"
                          : "Not Independent"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        UN Member
                      </p>
                      <p className="mt-1">{country.unMember ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Facts
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Continent</span>
                  <span className="font-medium">{country.region}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Population Density</span>
                  <span className="font-medium">
                    {country.area
                      ? `${(country.population / country.area).toFixed(2)}/km²`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Capital</span>
                  <span className="font-medium">
                    {country.capital ? country.capital[0] : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Driving Side</span>
                  <span className="font-medium capitalize">
                    {country.car?.side || "N/A"}
                  </span>
                </div>
                {country.gini && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">GINI Index</span>
                    <span className="font-medium">
                      {Object.values(country.gini)[0]}%
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Currency</span>
                  <span className="font-medium">
                    {country.currencies
                      ? Object.entries(country.currencies)[0][1].name
                      : "N/A"}
                  </span>
                </div>
                {country.startOfWeek && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Week Starts</span>
                    <span className="font-medium capitalize">
                      {country.startOfWeek}
                    </span>
                  </div>
                )}
              </div>

              {/* Map Preview (could be expanded with a full mapping library) */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Location
                </h3>
                <CountryLocationMap country={country} colors={COLORS} />
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Geography & Location
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Region</p>
                    <p className="mt-1">{country.region}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Subregion
                    </p>
                    <p className="mt-1">{country.subregion || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Latitude/Longitude
                    </p>
                    <p className="mt-1">
                      {country.latlng
                        ? `${country.latlng[0]}°, ${country.latlng[1]}°`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Timezone(s)
                    </p>
                    <div className="mt-1 max-h-20 overflow-y-auto">
                      {country.timezones
                        ? country.timezones.map((zone, index) => (
                            <div key={index} className="text-sm">
                              {zone}
                            </div>
                          ))
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "statistics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Population and Area Comparison Charts */}
            <div className="space-y-10">
              {/* Population Comparison Chart */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Population Comparison
                </h3>
                <div className="h-80 w-full">
                  {getPopulationChartData().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getPopulationChartData()}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          tickFormatter={formatLargeNumber}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          dataKey="value"
                          name="Population"
                          fill={COLORS.primary}
                          radius={[4, 4, 0, 0]}
                        >
                          {getPopulationChartData().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.name === country.name.common
                                  ? COLORS.primary
                                  : COLORS.tertiary
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        No border countries to compare
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Area Comparison Chart */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Area Comparison (km²)
                </h3>
                <div className="h-80 w-full">
                  {getAreaChartData().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getAreaChartData()}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          tickFormatter={formatLargeNumber}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          dataKey="value"
                          name="Area (km²)"
                          fill={COLORS.secondary}
                          radius={[4, 4, 0, 0]}
                        >
                          {getAreaChartData().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.name === country.name.common
                                  ? COLORS.secondary
                                  : COLORS.quaternary
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                      <p className="text-gray-500">
                        No border countries to compare
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Languages Pie Chart */}
            <div>
              {country.languages &&
              Object.keys(country.languages).length > 0 ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">
                    Languages
                  </h3>
                  <div className="h-96 w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getLanguageData()}
                          cx="62%"
                          cy="50%"
                          labelLine={true}
                          label={({ name }) => name}
                          outerRadius={140} 
                          innerRadius={6}
                          fill={COLORS.primary}
                          dataKey="value"
                        >
                          {getLanguageData().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                          wrapperStyle={{ paddingLeft: "20px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Additional language info below chart */}
                  <div className="mt-8 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Language Information
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(country.languages || {}).map(
                        ([code, name], index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center border-b border-gray-200 py-2 last:border-0"
                          >
                            <span className="text-gray-800">{name}</span>
                            <span className="text-gray-500 text-sm uppercase">
                              {code}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg p-8">
                  <div className="text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                      />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      No Language Data
                    </h3>
                    <p className="mt-2 text-gray-500">
                      Language information is not available for this country.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Border Countries Tab */}
        {activeTab === "borders" && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              Bordering Countries
            </h3>

            {borderCountries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {borderCountries.map((borderCountry) => (
                  <Link
                    to={`/country/${borderCountry.cca3}`}
                    key={borderCountry.cca3}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="h-32 overflow-hidden">
                      <img
                        src={borderCountry.flags.svg}
                        alt={`Flag of ${borderCountry.name.common}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900">
                        {borderCountry.name.common}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {borderCountry.capital
                          ? borderCountry.capital[0]
                          : "N/A"}
                      </p>
                      <div className="mt-2 flex justify-between text-sm">
                        <span>
                          {formatPopulation(borderCountry.population)}
                        </span>
                        <span>{borderCountry.region}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-10 text-center">
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
                    strokeWidth={1.5}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Island Nation
                </h3>
                <p className="mt-2 text-gray-500">
                  This country doesn't share land borders with any other
                  countries.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {/* <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: COLORS.primary,
            "--tw-ring-color": COLORS.primary,
          }}
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
        </Link>
      </div> */}
    </div>
  );
};

export default CountryDetail;
