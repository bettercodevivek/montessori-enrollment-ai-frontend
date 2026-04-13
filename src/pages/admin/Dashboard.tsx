import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MetricCard } from '../../components/MetricCard';
import api from '../../api/axios';
import { Loader2, TrendingUp, School, Filter } from 'lucide-react';
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
  // Analytics data
  callsByMonth: Array<{ month: string; total: number; inquiries: number; tourBookings: number }>;
  callsBySchool: Array<{ name: string; calls: number; tourBookings: number }>;
  topSchools: Array<{ name: string; status: string; total_calls: number; tour_bookings: number; followups_sent: number }>;
}

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'all' | 'monthly' | 'custom'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      
      if (dateFilter === 'monthly' && selectedMonth) {
        params.month = selectedMonth;
      } else if (dateFilter === 'custom' && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      const [dashboardRes, analyticsRes] = await Promise.all([
        api.get('/admin/dashboard', { params }),
        api.get('/admin/analytics', { params })
      ]);
      
      setData({
        ...dashboardRes.data,
        ...analyticsRes.data
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter, selectedMonth, startDate, endDate]);

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
        
        {/* Date Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Filter:</span>
          </div>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom Range</option>
          </select>
          
          {dateFilter === 'monthly' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start date"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="End date"
              />
            </div>
          )}
          
          {(dateFilter !== 'all') && (
            <button
              onClick={() => {
                setDateFilter('all');
                setSelectedMonth('');
                setStartDate('');
                setEndDate('');
              }}
              className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {data.metrics?.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

      {/* Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Calls by Month */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Calls by Month</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.callsByMonth?.map(m => ({
              month: m.month,
              total: m.total,
              inquiries: m.inquiries,
              tourBookings: m.tourBookings
            })) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
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
                dataKey="total" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Total Calls"
              />
              <Line 
                type="monotone" 
                dataKey="inquiries" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Inquiries"
              />
              <Line 
                type="monotone" 
                dataKey="tourBookings" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
                name="Tour Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Calls per School */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <School className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Calls by School</h2>
          </div>
          <div className="space-y-5 max-h-[300px] overflow-y-auto">
            {data.callsBySchool?.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-900 truncate max-w-[180px]">{s.name}</span>
                  <span className="text-xs text-slate-400">{s.calls} calls</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-slate-700 h-full rounded-full transition-all" style={{ width: `${(s.calls / Math.max(...data.callsBySchool.map(sc => sc.calls), 1)) * 100}%` }} />
                </div>
                <div className="flex gap-4 mt-1.5">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    <span className="text-xs text-slate-400">Inquiries: {s.tourBookings}</span>
                  </div>
                </div>
              </div>
            ))}
            {data.callsBySchool?.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">No school data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Schools Section */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <School className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Top Performing Schools</h2>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {data.topSchools?.map((school, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">#{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{school.name}</p>
                    <p className="text-xs text-slate-400">{school.total_calls} calls · {school.tour_bookings} tours</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${school.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                  {school.status}
                </span>
              </div>
            ))}
            {data.topSchools?.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">No school data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
