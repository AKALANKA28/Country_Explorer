import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-black to-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <svg
                  className="h-8 w-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <span className="ml-2 text-white font-bold text-xl">CountryExplorer</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className={`${isActive('/') 
                    ? 'bg-[#38B2AC] text-white' 
                    : 'text-white hover:bg-[#38B2AC] hover:bg-opacity-75'
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Home
                </Link>
                {currentUser && (
                  <Link
                    to="/favorites"
                    className={`${isActive('/favorites') 
                      ? 'bg-[#38B2AC] text-white' 
                      : 'text-white hover:bg-[#38B2AC] hover:bg-opacity-75'
                    } px-3 py-2 rounded-md text-sm font-medium`}
                  >
                    Favorites
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {currentUser ? (
                <div className="flex items-center">
                  <span className="text-white mr-4">Welcome, {currentUser.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-white hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className={`${isActive('/login') 
                      ? 'bg-gray-100 text-[#38B2AC]' 
                      : 'bg-white text-[#38B2AC] hover:bg-gray-100'
                    } font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`${isActive('/register') 
                      ? 'bg-[#38B2AC] text-white border-transparent' 
                      : 'bg-transparent text-white hover:bg-[#38B2AC] hover:text-white border border-white hover:border-transparent'
                    } font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out`}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-[#38B2AC] inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-[#2C9296] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#38B2AC] focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`${isActive('/') 
                ? 'bg-[#38B2AC] text-white' 
                : 'text-white hover:bg-[#38B2AC] hover:bg-opacity-75'
              } block px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {currentUser && (
              <Link
                to="/favorites"
                className={`${isActive('/favorites') 
                  ? 'bg-[#38B2AC] text-white' 
                  : 'text-white hover:bg-[#38B2AC] hover:bg-opacity-75'
                } block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                Favorites
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            {currentUser ? (
              <div className="flex items-center px-5">
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">{currentUser.name}</div>
                  <div className="text-sm font-medium leading-none text-gray-300">{currentUser.email}</div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="ml-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-3 px-2 space-y-1">
                <Link
                  to="/login"
                  className={`${isActive('/login') 
                    ? 'bg-[#2C9296] text-white' 
                    : 'bg-[#38B2AC] text-white hover:bg-[#2C9296]'
                  } block px-3 py-2 rounded-md text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`${isActive('/register') 
                    ? 'bg-[#38B2AC] border-transparent' 
                    : 'bg-transparent border border-white hover:bg-[#38B2AC]'
                  } block text-white px-3 py-2 rounded-md text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;