import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Tooltip, Popup } from 'react-leaflet';
import { CountryContext } from '../../context/CountryContext';
import { AuthContext } from '../../context/AuthContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// New color scheme
const COLORS = {
  primary: '#38B2AC', // Teal for regular countries (replaced blue)
  favorite: '#805AD5', // Purple for favorites (replaced gold/amber)
  accent: '#4A5568',   // Dark gray for text
  light: '#F7FAFC',    // Very light gray for backgrounds
  border: '#E2E8F0'    // Light gray for borders
};

// Create custom marker icons
const createMarkerIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.25);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

// Format population with commas
const formatPopulation = (population) => {
  return population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const WorldMap = () => {
  const { countries, filteredCountries, isFavorite } = useContext(CountryContext);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mapLoaded, setMapLoaded] = useState(false);

  // Set map default properties
  const mapCenter = [20, 0];
  const mapZoom = 2;
  
  // Initialize map when component mounts
  useEffect(() => {
    setMapLoaded(true);
  }, []);

  // Filter countries that have valid coordinates
  const countriesWithCoordinates = filteredCountries.filter(country => 
    country.latlng && country.latlng.length === 2
  );

  const handleCountryClick = (countryCode) => {
    navigate(`/country/${countryCode}`);
  };

  // Create a marker for each country
  const renderMarkers = () => {
    return countriesWithCoordinates.map(country => {
      const isCountryFavorite = currentUser && isFavorite(country.cca3);
      const markerColor = isCountryFavorite ? COLORS.favorite : COLORS.primary;
      const icon = createMarkerIcon(markerColor);
      
      return (
        <Marker 
          key={country.cca3}
          position={[country.latlng[0], country.latlng[1]]} 
          icon={icon}
          eventHandlers={{
            click: () => handleCountryClick(country.cca3),
          }}
        >
          {/* Enhanced tooltip that appears on hover */}
          <Tooltip 
            direction="top" 
            offset={[0, -5]} 
            opacity={1}
            permanent={false}
            className="custom-tooltip"
          >
            <div className="country-tooltip">
              <div className="flex items-center mb-1">
                <img 
                  src={country.flags.svg} 
                  alt={`Flag of ${country.name.common}`}
                  className="w-6 h-4 mr-2 border border-gray-300"
                />
                <span className="font-bold text-sm">{country.name.common}</span>
              </div>
              <div className="text-xs grid grid-cols-2 gap-x-3 gap-y-1">
                <div>Capital:</div>
                <div className="font-medium">{country.capital ? country.capital[0] : 'N/A'}</div>
                
                <div>Region:</div>
                <div className="font-medium">{country.region}</div>
                
                <div>Population:</div>
                <div className="font-medium">{formatPopulation(country.population)}</div>
              </div>
            </div>
          </Tooltip>
          
          {/* Popup that appears on click */}
          <Popup>
            <div className="text-center">
              <img 
                src={country.flags.svg} 
                alt={`Flag of ${country.name.common}`} 
                className="w-20 h-12 object-cover mx-auto mb-2 border"
              />
              <div className="font-medium text-lg">{country.name.common}</div>
              <div className="text-sm text-gray-600 mb-1">{country.capital ? country.capital[0] : 'N/A'}</div>
              <div className="text-xs mb-2">Population: {formatPopulation(country.population)}</div>
              <button 
                onClick={() => handleCountryClick(country.cca3)}
                className="mt-1 px-3 py-1 text-sm bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                style={{ backgroundColor: COLORS.primary }}
              >
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      );
    });
  };

  if (!mapLoaded) {
    return (
      <div className="flex justify-center items-center h-[500px]" style={{ backgroundColor: COLORS.light }}>
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12" 
             style={{ borderTopColor: COLORS.primary }}></div>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-lg bg-white overflow-hidden">
      <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-2" 
           style={{ backgroundColor: COLORS.light, borderColor: COLORS.border }}>
        <h2 className="font-bold text-lg" style={{ color: COLORS.accent }}>Interactive World Map</h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full inline-block mr-1" 
                  style={{ backgroundColor: COLORS.primary }}></span>
            <span className="text-sm" style={{ color: COLORS.accent }}>Countries</span>
          </div>
          {currentUser && (
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full inline-block mr-1" 
                    style={{ backgroundColor: COLORS.favorite }}></span>
              <span className="text-sm" style={{ color: COLORS.accent }}>Favorites</span>
            </div>
          )}
          <div className="text-xs" style={{ color: COLORS.accent }}>
            {countriesWithCoordinates.length} countries displayed
          </div>
        </div>
      </div>
      
      <div style={{ height: '500px', width: '100%', zIndex: 0 }} className="relative">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: '100%', width: '100%' }}
          minZoom={1}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {renderMarkers()}
        </MapContainer>
      </div>

      <div className="p-3 text-left text-sm border-t" 
           style={{ backgroundColor: COLORS.light, borderColor: COLORS.border, color: COLORS.accent }}>
        Hover over markers to see country information • Click for more details
      </div>
    </div>
  );
};

export default WorldMap;