/**
 * Named re-exports for remote theme bundles.
 * Keep explicit exports so Vite CJS interop exposes them to blob-loaded themes.
 */
export {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  BrowserRouter,
  MemoryRouter,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
  useMatch,
  useResolvedPath,
  useOutletContext,
  createSearchParams,
} from 'react-router-dom';
