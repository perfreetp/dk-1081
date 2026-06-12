import { useState, useEffect } from 'react';
import { useAuthStore } from './stores/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import RouteList from './pages/RouteList';
import ExceptionList from './pages/ExceptionList';
import MaintenanceList from './pages/MaintenanceList';
import SparePartsList from './pages/SparePartsList';
import Statistics from './pages/Statistics';

type PageType = 'dashboard' | 'equipment' | 'routes' | 'exceptions' | 'maintenance' | 'spare-parts' | 'statistics';

export default function App() {
  const { isLoggedIn, login } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  const handleLoginSuccess = () => {
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      login({ username: '', password: '' }).catch(() => {});
    }
  }, []);

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'equipment':
        return <EquipmentList onNavigate={handleNavigate} />;
      case 'routes':
        return <RouteList onNavigate={handleNavigate} />;
      case 'exceptions':
        return <ExceptionList onNavigate={handleNavigate} />;
      case 'maintenance':
        return <MaintenanceList onNavigate={handleNavigate} />;
      case 'spare-parts':
        return <SparePartsList onNavigate={handleNavigate} />;
      case 'statistics':
        return <Statistics onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderPage()}
    </div>
  );
}
