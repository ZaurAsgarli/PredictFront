import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  ShoppingCart,
  AlertTriangle,
  BarChart3,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { authService } from '../../../src/services/auth';

// Admin app routes (without /admin prefix)
const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: TrendingUp, label: 'Markets', href: '/markets' },
  { icon: Users, label: 'Users', href: '/users' },
  { icon: ShoppingCart, label: 'Trades', href: '/trades' },
  { icon: AlertTriangle, label: 'Disputes', href: '/disputes' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
];

export default function AdminSidebarWrapper({ isOpen, setIsOpen }) {
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-16'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {isOpen && (
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href || 
                  (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} />
                      {isOpen && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut size={20} />
              {isOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

