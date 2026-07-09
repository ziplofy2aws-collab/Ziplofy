import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import AuthProvider from './contexts/auth.context';
import { clientEnv } from './config/env';
import Login from './pages/login';
import Register from './pages/Register';

function App() {
  console.log(`App running in ${import.meta.env.MODE} mode`);
  console.log(`Vite API URL: ${clientEnv.apiUrl}`);
  return (
    <GoogleOAuthProvider clientId={clientEnv.googleClientId}>
      <Toaster position="top-right" />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
