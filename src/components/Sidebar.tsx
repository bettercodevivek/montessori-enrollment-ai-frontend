import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Plug, 
  Settings, 
  MessageSquare, 
  FileText, 
  Users,
  BarChart3,
  Share2
} from 'lucide-react';
import type { UserRole } from '../types';

interface SidebarItem {
  path: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface SidebarProps {
  role: UserRole;
}

const schoolItems: SidebarItem[] = [
  { path: '/school/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/school/integrations', label: 'Integrations', icon: Plug },
  { path: '/school/settings', label: 'Settings', icon: Settings },
  { path: '/school/followups', label: 'Followups', icon: MessageSquare },
  { path: '/school/forms', label: 'Forms', icon: FileText },
  { path: '/school/referrals', label: 'Referrals', icon: Share2 },
];

const adminItems: SidebarItem[] = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/schools', label: 'Schools', icon: Users },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/integrations', label: 'Integrations', icon: Plug },
  { path: '/admin/referrals', label: 'Referrals', icon: Share2 },
];

export const Sidebar = ({ role }: SidebarProps) => {
  const items = role === 'admin' ? adminItems : schoolItems;

  return (
    <div className="w-64 bg-blue-800/95 backdrop-blur-md border-r border-blue-700/50 h-screen fixed left-0 top-0 overflow-y-auto shadow-xl">
      <div className="p-6 border-b border-blue-200/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 border-2 border-blue-500/20">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg">E</span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">
            Enrollment AI
          </h1>
        </div>
      </div>
      <nav className="px-3 py-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-700/80 text-white font-semibold shadow-lg shadow-blue-900/20'
                    : 'text-blue-100 hover:bg-blue-700/40 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

