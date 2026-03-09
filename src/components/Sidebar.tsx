import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart3, School, Settings, Users, Plug2, History, FileText, LayoutDashboard
} from 'lucide-react';

interface SidebarProps {
  role: 'admin' | 'school';
}

export const Sidebar = ({ role }: SidebarProps) => {
  const { t } = useTranslation();

  const adminItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
    { path: '/admin/schools', icon: School, labelKey: 'schools' },
    { path: '/admin/analytics', icon: BarChart3, labelKey: 'analytics' },
    { path: '/admin/integrations', icon: Plug2, labelKey: 'integrations' },
    { path: '/admin/referrals', icon: Users, labelKey: 'referrals' },
  ];

  const schoolItems = [
    { path: '/school/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
    { path: '/school/integrations', icon: Plug2, labelKey: 'integrations' },
    { path: '/school/settings', icon: Settings, labelKey: 'settings' },
    { path: '/school/followups', icon: History, labelKey: 'followups' },
    { path: '/school/forms', icon: FileText, labelKey: 'forms' },
    { path: '/school/referrals', icon: Users, labelKey: 'referrals' },
  ];

  const items = role === 'admin' ? adminItems : schoolItems;

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col z-30">
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">BB</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-none">{t('enrollment_ai')}</p>
            <p className="text-xs text-slate-400 capitalize mt-0.5">{role} portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    {t(item.labelKey)}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="px-5 py-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-slate-500 font-medium">{t('system_online')}</span>
        </div>
      </div>
    </div>
  );
};
