import { Menu, Bell, Search, User } from 'lucide-react';
import { authService } from '../../services/auth';
import { useEffect, useState } from 'react';

export default function AdminNavbar({ onMenuClick }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUserSync();
    setUser(currentUser);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              {user?.username?.[0]?.toUpperCase() || <User size={16} />}
            </div>
            {user && (
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


