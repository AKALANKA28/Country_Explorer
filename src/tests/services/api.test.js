import { fetchAllCountries, fetchCountryByCode } from '../../services/api';

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetchAllCountries calls correct endpoint and returns data', async () => {
    // Mock successful response
    const mockCountries = [{ name: { common: 'Finland' } }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCountries
    });

    const result = await fetchAllCountries();

    // Check if fetch was called with the correct URL
    expect(global.fetch).toHaveBeenCalledWith(
      'https://restcountries.com/v3.1/all'
    );
    expect(result).toEqual(mockCountries);
  });

  test('fetchAllCountries handles errors', async () => {
    // Mock error response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error' })
    });

    await expect(fetchAllCountries()).rejects.toThrow('HTTP error! Status: 500');
  });

  test('fetchCountryByCode calls correct endpoint with country code', async () => {
    // Mock successful response
    const mockCountry = [{ name: { common: 'Test' } }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCountry
    });

    const result = await fetchCountryByCode('TST');

    // Check if fetch was called with the correct URL
    expect(global.fetch).toHaveBeenCalledWith(
      'https://restcountries.com/v3.1/alpha/TST'
    );
    expect(result).toEqual(mockCountry[0]);
  });

  test('fetchCountryByCode handles errors', async () => {
    // Mock error response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' })
    });

    await expect(fetchCountryByCode('XXX')).rejects.toThrow('HTTP error! Status: 404');
  });
});