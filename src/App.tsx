import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import Login from './components/Auth/Login';
import Workspace from './components/Workspace/Workspace';
import Spinner from './components/UI/Spinner';
import DocsPage from './components/Docs/DocsPage';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner size="lg" text="Carregando DESCRIPTA..." />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/" element={user ? <Workspace /> : <Login />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
