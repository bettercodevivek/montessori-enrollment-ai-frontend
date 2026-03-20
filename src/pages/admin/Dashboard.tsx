import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MetricCard } from '../../components/MetricCard';
import { StatusBadge } from '../../components/StatusBadge';
import api from '../../api/axios';
import { Loader2, Phone } from 'lucide-react';

interface DashboardData {
  metrics: Array<{ label: string; value: number }>;
  recentCalls: Array<{
    id: string;
    school_name: string;
    caller_name: string;
    call_type: string;
    duration: number;
    timestamp: string;
  }>;
  recentFollowups: Array<{
    id: string;
    school_name: string;
    lead_name: string;
    type: string;
    status: string;
    timestamp: string;
  }>;
}

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error('Failed to load dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="text-center py-12 text-slate-500">{t('could_not_load_dashboard')}</div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{t('admin_dashboard')}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{t('admin_dashboard_desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">{t('recent_calls')}</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentCalls.map((call) => (
              <div key={call.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{call.caller_name || t('unknown_caller')}</p>
                    <p className="text-xs text-slate-500">{call.school_name}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={call.call_type === 'inquiry' ? 'active' : 'inactive'} />
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(call.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {data.recentCalls.length === 0 && (
              <div className="px-5 py-10 text-center text-slate-400 text-sm">{t('no_calls_yet')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
