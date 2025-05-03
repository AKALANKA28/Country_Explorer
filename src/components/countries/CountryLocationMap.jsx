import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Define the component style
const mapContainerStyle = {
  height: '250px',
  width: '100%',
  borderRadius: '0.5rem',
};

const CountryLocationMap = ({ country, colors }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  
  // Default colors if not provided
  const COLORS = colors || {
    primary: '#38B2AC',
    favorite: '#805AD5'
  };

  useEffect(() => {
    // If map already initialized or no coordinates, return
    if (mapRef.current || !country.latlng || country.latlng.length !== 2) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [country.latlng[0], country.latlng[1]],
      zoom: 4,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false // Disable scroll wheel zoom for better UX in embedded map
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    // Create a custom marker icon
    const customIcon = L.divIcon({
      className: 'custom-marker-icon',
      html: `<div style="background-color: ${COLORS.primary}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    // Add marker for the country
    const marker = L.marker([country.latlng[0], country.latlng[1]], { 
      icon: customIcon 
    }).addTo(map);

    // Add a tooltip with country name
    marker.bindTooltip(country.name.common, { 
      permanent: false, 
      direction: 'top', 
      className: 'leaflet-tooltip-custom'
    });

    // If the country has defined borders, try to show the country outline
    if (country.borders && country.borders.length > 0) {
      // In a real app, you would load GeoJSON data for the country borders
      // For this example, we'll just create a circle representing the approximate country area
      const areaSize = Math.sqrt(country.area || 100000) * 0.01;
      L.circle([country.latlng[0], country.latlng[1]], {
        radius: areaSize * 1000, // Convert to meters
        fillColor: COLORS.primary,
        fillOpacity: 0.1,
        color: COLORS.primary,
        weight: 1,
        dashArray: '5, 5'
      }).addTo(map);
    }

    // Save map instance to ref
    mapRef.current = map;

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [country, COLORS]);

  // If no coordinates, display a message
  if (!country.latlng || country.latlng.length !== 2) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={mapContainerStyle}
      >
        <div className="text-gray-500 text-center px-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 mx-auto mb-2 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" 
            />
          </svg>
          <p>Geographic coordinates not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
      <div ref={mapContainerRef} style={mapContainerStyle}></div>
      <div className="py-2 px-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 flex justify-between items-center">
        <span>
          {country.latlng[0].toFixed(2)}°{country.latlng[0] >= 0 ? 'N' : 'S'}, {country.latlng[1].toFixed(2)}°{country.latlng[1] >= 0 ? 'E' : 'W'}
        </span>
        <span className="text-xs flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Click to zoom
        </span>
      </div>
    </div>
  );
};

export default CountryLocationMap;