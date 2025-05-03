import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { CountryContext } from '../../../context/CountryContext';
import CountryDetail from '../../../components/countries/CountryDetail';
import { fetchCountryByCode } from '../../../services/api';

// Mock dependencies
jest.mock('../../../services/api');
// jest.mock('react-router-dom', () => ({
//   ...jest.requireActual('react-router-dom'),
//   useParams: () => ({ code: 'USA' })
// }));
jest.mock('../../../components/countries/CountryLocationMap', () => ({
  __esModule: true,
  default: () => <div data-testid="location-map">Map Component</div>
}));

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }) => <div data-testid="bar">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />
}));

// Mock country data
const mockCountry = {
  name: {
    common: 'United States',
    official: 'United States of America',
    nativeName: {
      eng: {
        common: 'United States',
        official: 'United States of America'
      }
    }
  },
  cca3: 'USA',
  capital: ['Washington, D.C.'],
  region: 'Americas',
  subregion: 'North America',
  population: 331002651,
  area: 9372610,
  flags: {
    svg: 'usa-flag.svg',
    alt: 'The flag of the United States'
  },
  currencies: {
    USD: {
      name: 'United States Dollar',
      symbol: '$'
    }
  },
  languages: {
    eng: 'English'
  },
  borders: ['CAN', 'MEX'],
  latlng: [38, -97],
  timezones: ['UTC-12:00', 'UTC-11:00', 'UTC-10:00'],
  tld: ['.us'],
  car: {
    side: 'right'
  },
  independent: true,
  unMember: true,
  gini: {
    '2018': 41.4
  },
  startOfWeek: 'sunday'
};

const mockBorderCountries = [
  {
    name: { common: 'Canada' },
    cca3: 'CAN',
    capital: ['Ottawa'],
    region: 'Americas',
    population: 38005238,
    flags: { svg: 'canada-flag.svg' },
    area: 9984670
  },
  {
    name: { common: 'Mexico' },
    cca3: 'MEX',
    capital: ['Mexico City'],
    region: 'Americas',
    population: 126190788,
    flags: { svg: 'mexico-flag.svg' },
    area: 1964375
  }
];

// Mock context values
const mockAuthContext = {
  currentUser: { uid: 'test-user' }
};

const mockCountryContext = {
  isFavorite: jest.fn(() => false),
  toggleFavorite: jest.fn(),
  countries: [...mockBorderCountries]
};

const mockCountryContextWithFavorites = {
  ...mockCountryContext,
  isFavorite: jest.fn(() => true)
};

describe('CountryDetail component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchCountryByCode.mockResolvedValue(mockCountry);
  });

  const renderComponent = (
    authContext = mockAuthContext,
    countryContext = mockCountryContext
  ) => {
    return render(
      <MemoryRouter initialEntries={['/country/USA']}>
        <AuthContext.Provider value={authContext}>
          <CountryContext.Provider value={countryContext}>
            <Routes>
              <Route path="/country/:code" element={<CountryDetail />} />
            </Routes>
          </CountryContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  test('renders loading state initially', () => {
    renderComponent();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('loads and displays country data', async () => {
    renderComponent();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    // Check if basic country details are rendered
    expect(screen.getByText('United States of America')).toBeInTheDocument();
    expect(screen.getByText('Washington, D.C.')).toBeInTheDocument();
    expect(screen.getByText('Americas')).toBeInTheDocument();
    expect(screen.getByText('North America')).toBeInTheDocument();
    expect(screen.getByText('331,002,651')).toBeInTheDocument();  // Formatted population
    
    // Check if additional details are rendered
    expect(screen.getByText('United States Dollar')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('.us')).toBeInTheDocument();
  });

  test('displays error state when API call fails', async () => {
    fetchCountryByCode.mockRejectedValue(new Error('Failed to fetch'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error!/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to fetch country details/i)).toBeInTheDocument();
    });
  });

  test('displays favorite button when user is logged in', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /add to favorites/i })).toBeInTheDocument();
  });

  test('does not display favorite button when user is not logged in', async () => {
    renderComponent({ currentUser: null });

    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /add to favorites/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remove from favorites/i })).not.toBeInTheDocument();
  });

  test('toggles favorite status when favorite button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
    fireEvent.click(favoriteButton);

    expect(mockCountryContext.toggleFavorite).toHaveBeenCalledWith('USA');
  });

  test('displays filled star when country is favorited', async () => {
    renderComponent(mockAuthContext, mockCountryContextWithFavorites);

    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /remove from favorites/i })).toBeInTheDocument();
  });

  test('changes tab when tab buttons are clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    // Initially on Overview tab
    expect(screen.getByText('Essential Information')).toBeInTheDocument();

    // Click Statistics tab
    const statisticsTab = screen.getByRole('button', { name: /statistics/i });
    fireEvent.click(statisticsTab);

    // Statistics content should be visible
    expect(screen.getByText('Population Comparison')).toBeInTheDocument();
    expect(screen.getByText('Area Comparison (km²)')).toBeInTheDocument();

    // Click Borders tab
    const bordersTab = screen.getByRole('button', { name: /border countries/i });
    fireEvent.click(bordersTab);

    // Border countries content should be visible
    expect(screen.getByText('Bordering Countries')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.getByText('Mexico')).toBeInTheDocument();
  });

  test('displays message when country has no borders', async () => {
    const countryWithNoBorders = {
      ...mockCountry,
      borders: []
    };
    fetchCountryByCode.mockResolvedValue(countryWithNoBorders);
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    const bordersTab = screen.getByRole('button', { name: /border countries/i });
    fireEvent.click(bordersTab);

    expect(screen.getByText('Island Nation')).toBeInTheDocument();
    expect(screen.getByText(/doesn't share land borders/i)).toBeInTheDocument();
  });

  test('back button has the correct link', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('link', { name: /back to all countries/i });
    expect(backButton).toHaveAttribute('href', '/');
  });

  test('displays flag and flag description', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    const flagImage = screen.getAllByAltText('Flag of United States')[0];
    expect(flagImage).toBeInTheDocument();
    expect(flagImage).toHaveAttribute('src', 'usa-flag.svg');

    // Check flag description
    expect(screen.getByText('The flag of the United States')).toBeInTheDocument();
  });

  test('displays location map component', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    expect(screen.getByTestId('location-map')).toBeInTheDocument();
  });
});