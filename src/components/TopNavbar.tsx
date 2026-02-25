import { useAuthStore } from '../store/authStore';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TopNavbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-16 bg-white/90 backdrop-blur-md border-b border-blue-200/50 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10 shadow-md">
      <div className="flex-1"></div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-blue-50/80 text-sm border border-blue-100/50">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-blue-800 font-semibold">{user?.name}</span>
            <span className="text-xs text-blue-600 capitalize">{user?.role}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-100 rounded-xl transition-all duration-200 hover:text-blue-800 font-semibold"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

