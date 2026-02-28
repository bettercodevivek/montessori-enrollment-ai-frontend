import { useAuthStore } from '../store/authStore';
import { LogOut, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const TopNavbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
  };

  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-20">
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          <Globe className="w-4 h-4" />
          {i18n.language === 'en' ? 'ES' : 'EN'}
        </button>

        <div className="flex items-center gap-2.5 border border-slate-200 rounded-lg px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900 leading-none">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize mt-0.5">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          {t('logout')}
        </button>
      </div>
    </div>
  );
};
