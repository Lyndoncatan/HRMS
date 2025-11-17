import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import ProductsPage from './components/ProductsPage';
import UsersPage from './components/UsersPage';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'products' | 'users'>('products');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#174978' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  if (profile.status === 'blocked') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#174978' }}>
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#174978' }}>Account Blocked</h2>
          <p className="text-gray-600">Your account has been blocked. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'products' ? <ProductsPage /> : <UsersPage />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
