import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import AdminAuthGuard from '../components/AdminAuthGuard';

export default function AdminLayout({ children }) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar />
        <div className="lg:ml-64">
          <AdminNavbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}


