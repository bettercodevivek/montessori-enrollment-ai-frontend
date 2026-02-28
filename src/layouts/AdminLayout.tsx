import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopNavbar } from '../components/TopNavbar';
import { useAuthStore } from '../store/authStore';

export const AdminLayout = () => {
  const { user } = useAuthStore();

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="admin" />
      <div className="flex-1 ml-64">
        <TopNavbar />
        <main className="pt-16 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

