import React from 'react';
import SearchBar from '../components/countries/SearchBar';
import FilterOptions from '../components/countries/FilterOptions';
import CountryList from '../components/countries/CountryList';

const Home = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <SearchBar />
        <FilterOptions />
      </div>
      
      <CountryList />
    </div>
  );
};

export default Home;