# CountryExplorer

A React application that allows users to explore countries around the world using the REST Countries API. This project demonstrates skills in front-end development, API integration, and user interface design.

## Live Demo

[View the Live Demo](https://country-explorer-delta.vercel.app/)

## Features

- Browse through all countries with essential information
- Search countries by name
- Filter countries by region
- View detailed information about each country
- Add countries to favorites (requires login)
- Responsive design for all device sizes

## Technologies Used

- **Frontend Framework**: React with functional components
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: Context API
- **Authentication**: Local storage-based authentication (simulated)
- **API**: REST Countries API
- **Testing**: Jest and React Testing Library

## API Integration

This application uses the REST Countries API with the following endpoints:

1. `GET /all` - Fetch all countries
2. `GET /name/{name}` - Search countries by name
3. `GET /region/{region}` - Filter countries by region
4. `GET /alpha/{code}` - Get detailed information about a specific country

## Setup and Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/country-explorer.git
   cd country-explorer
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```

4. To build for production
   ```bash
   npm run build
   ```

5. To run tests
   ```bash
   npm test
   ```

## Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Navbar, Footer, etc.)
│   ├── countries/       # Country-related components
│   └── auth/            # Authentication components
├── context/             # React Context for state management
├── services/            # API services
├── pages/               # Page components
├── utils/               # Helper utilities
└── tests/               # Test files
```

## User Authentication

This application includes a simulated user authentication system:

- Users can register and log in
- User sessions are maintained using localStorage
- Authenticated users can add countries to their favorites
- Favorites are persisted in localStorage

## Testing

The application includes unit and integration tests covering key functionality:

- Component rendering
- API integration
- State management
- User interactions

Run tests with:
```bash
npm test
```

## Responsive Design

The application is fully responsive and works well on:
- Mobile devices
- Tablets
- Desktop computers
