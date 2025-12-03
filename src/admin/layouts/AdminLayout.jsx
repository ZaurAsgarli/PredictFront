import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <AdminNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}


