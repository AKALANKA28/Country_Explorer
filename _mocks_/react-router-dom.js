const reactRouterDOM = jest.requireActual('react-router-dom');

module.exports = {
  ...reactRouterDOM,
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Link: ({ to, children, className }) => (
    <a href={to} className={className} data-testid="mock-link">{children}</a>
  ),
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => <div>{element}</div>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
};