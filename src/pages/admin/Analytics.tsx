import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Loader2, BarChart3, TrendingUp, Phone, Users } from 'lucide-react';

interface AnalyticsData {
  callsByMonth: Array<{ month: string; total: number; inquiries: number; general: number; routed: number }>;
  callsBySchool: Array<{ name: string; calls: number; inquiries: number }>;
  followupStats: Array<{ type: string; status: string; count: number }>;
  topSchools: Array<{ name: string; status: string; total_calls: number; inquiry_calls: number; followups_sent: number }>;
}

export const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(res => setData(res.data))
      .catch(err => console.error('Failed to load analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="text-center py-12 text-slate-500">Failed to load analytics data.</div>
  );

  const maxCalls = Math.max(...data.callsBySchool.map(s => s.calls), 1);
  const maxMonthlyCalls = Math.max(...data.callsByMonth.map(m => m.total), 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform-wide performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Calls by Month */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Calls by Month</h2>
          </div>
          <div className="space-y-5">
            {data.callsByMonth.map((m) => (
              <div key={m.month}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-700">{m.month}</span>
                  <span className="text-xs text-slate-400">{m.total} calls</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="flex h-full">
                    <div className="bg-blue-600" style={{ width: `${(m.inquiries / maxMonthlyCalls) * 100}%` }} />
                    <div className="bg-slate-300" style={{ width: `${(m.general / maxMonthlyCalls) * 100}%` }} />
                  </div>
                </div>
                <div className="flex gap-4 mt-1.5">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    <span className="text-xs text-slate-400">Inquiry: {m.inquiries}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    <span className="text-xs text-slate-400">General: {m.general}</span>
                  </div>
                </div>
              </div>
            ))}
            {data.callsByMonth.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">No monthly data yet.</p>
            )}
          </div>
        </div>

        {/* Calls per School */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Calls by School</h2>
          </div>
          <div className="space-y-5">
            {data.callsBySchool.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-900 truncate max-w-[180px]">{s.name}</span>
                  <span className="text-xs text-slate-400">{s.calls} calls</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-slate-700 h-full rounded-full transition-all" style={{ width: `${(s.calls / maxCalls) * 100}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {s.inquiries} inquiries ({Math.round((s.inquiries / Math.max(s.calls, 1)) * 100)}%)
                </p>
              </div>
            ))}
            {data.callsBySchool.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">No school data yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follow-up Stats */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Follow-up Summary</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {data.followupStats.map((stat, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-1">{stat.type} · {stat.status}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.count}</p>
              </div>
            ))}
            {data.followupStats.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8 col-span-2">No follow-up data yet.</p>
            )}
          </div>
        </div>

        {/* Top Schools */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Phone className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Top Schools</h2>
          </div>
          <div className="space-y-3">
            {data.topSchools.map((school, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">#{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{school.name}</p>
                    <p className="text-xs text-slate-400">{school.total_calls} calls · {school.inquiry_calls} inquiries</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${school.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                  {school.status}
                </span>
              </div>
            ))}
            {data.topSchools.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">No school data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
