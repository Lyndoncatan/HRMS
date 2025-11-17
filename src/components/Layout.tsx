import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Package, Users, Shield } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: 'products' | 'users';
  onNavigate: (page: 'products' | 'users') => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { profile, signOut } = useAuth();

  const canManageUsers = profile?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="shadow-sm" style={{ backgroundColor: '#174978' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ffcc00' }}>
                <Shield className="w-6 h-6" style={{ color: '#174978' }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">HRMS</h1>
                <p className="text-xs" style={{ color: '#ffcc00' }}>Human Resource Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{profile?.full_name || profile?.email}</p>
                <p className="text-xs uppercase tracking-wide" style={{ color: '#ffcc00' }}>
                  {profile?.role.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
                style={{ backgroundColor: '#ffcc00', color: '#174978' }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => onNavigate('products')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 border-b-2 ${
                currentPage === 'products'
                  ? 'border-current'
                  : 'border-transparent hover:border-gray-300'
              }`}
              style={currentPage === 'products' ? { color: '#174978', borderColor: '#ffcc00' } : { color: '#6b7280' }}
            >
              <Package className="w-5 h-5" />
              Products
            </button>

            {canManageUsers && (
              <button
                onClick={() => onNavigate('users')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 border-b-2 ${
                  currentPage === 'users'
                    ? 'border-current'
                    : 'border-transparent hover:border-gray-300'
                }`}
                style={currentPage === 'users' ? { color: '#174978', borderColor: '#ffcc00' } : { color: '#6b7280' }}
              >
                <Users className="w-5 h-5" />
                User Management
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
