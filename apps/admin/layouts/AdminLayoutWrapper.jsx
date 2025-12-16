import { useState } from 'react';
import AdminSidebarWrapper from '../components/AdminSidebarWrapper';
import AdminNavbar from '../../../src/admin/components/AdminNavbar';

export default function AdminLayoutWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebarWrapper isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <AdminNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

