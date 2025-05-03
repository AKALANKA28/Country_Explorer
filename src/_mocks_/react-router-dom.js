import React from 'react';

// Export named components/hooks
export const Link = ({ to, children, className, ...rest }) => (
  <a href={to} className={className} data-testid="mock-link" {...rest}>
    {children}
  </a>
);

export const BrowserRouter = ({ children }) => (
  <div data-testid="browser-router">{children}</div>
);

export const Routes = ({ children }) => (
  <div data-testid="routes">{children}</div>
);

export const Route = ({ path, element }) => (
  <div data-path={path} data-testid="route">
    {element}
  </div>
);

export const MemoryRouter = ({ children, initialEntries }) => (
  <div data-testid="memory-router" data-initial-entries={JSON.stringify(initialEntries)}>
    {children}
  </div>
);

export const useNavigate = () => jest.fn();
export const useParams = () => ({ code: 'USA' });
export const useLocation = () => ({ 
  pathname: '/', 
  search: '', 
  hash: '', 
  state: null 
});

export const NavLink = props => <Link {...props} />;

// Default export for CommonJS compatibility
const ReactRouterDOM = {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  MemoryRouter,
  useNavigate,
  useParams,
  useLocation
};

export default ReactRouterDOM;