import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MetricCard } from '../../components/MetricCard';
import api from '../../api/axios';
import { Loader2, TrendingUp, School } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardData {
  metrics: Array<{ label: string; value: number }>;
  callMinutesOverTime: Array<{
    _id: string;
    totalMinutes: number;
    totalCalls: number;
  }>;
  topSchoolsByMinutes: Array<{
    schoolId: string;
    schoolName: string;
    totalMinutes: number;
    totalCalls: number;
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {data.metrics?.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Minutes Line Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Call Minutes Trend (Last 30 Days)</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.callMinutesOverTime?.map(item => ({
              date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              minutes: Math.round(item.totalMinutes / 60)
            })) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="minutes" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Schools by Call Minutes */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <School className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Top Schools by Call Minutes</h2>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {data.topSchoolsByMinutes?.length > 0 ? (
              <div className="space-y-3">
                {data.topSchoolsByMinutes.map((school, index) => (
                  <div key={school.schoolId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{school.schoolName}</p>
                        <p className="text-xs text-slate-500">{school.totalCalls} calls</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {Math.round(school.totalMinutes / 60)} min
                      </p>
                      <p className="text-xs text-slate-500">
                        {school.totalCalls} calls
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                No call data available yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
