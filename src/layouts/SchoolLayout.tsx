import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopNavbar } from '../components/TopNavbar';
import { useAuthStore } from '../store/authStore';

export const SchoolLayout = () => {
  const { user } = useAuthStore();

  if (!user || user.role !== 'school') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-surface-light via-surface-DEFAULT to-surface-dark">
      <Sidebar role="school" />
      <div className="flex-1 ml-64">
        <TopNavbar />
        <main className="pt-16 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

