import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, PlayCircle, Activity, PhoneCall, MessageSquare, Mail, FileText, ChevronDown, ChevronUp, Calendar, Mic, TrendingUp, Save, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MetricCard } from '../../components/MetricCard';
import api from '../../api/axios';

interface DashboardResponse {
  metrics: Array<{ label: string; value: number; change?: number }>;
  chartData: Array<{ name: string; calls: number; inquiries: number }>;
  recentCalls: Array<{
    id: string;
    callerName: string;
    callerPhone: string;
    callType: string;
    duration: number;
    timestamp: string;
    recordingUrl: string | null;
  }>;
}

export const SchoolDashboard = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [testPhone, setTestPhone] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testMessage, setTestMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submissions, setSubmissions] = useState<Array<{
    id: string;
    parentName: string;
    email: string;
    phone: string;
    answers: Array<{ questionId: string; question: string; value: string }>;
    submittedAt: string;
  }>>([]);
  const [tourBookings, setTourBookings] = useState<Array<{
    id: string;
    parentName: string;
    phone: string;
    email: string;
    scheduledAt: string;
    calendarProvider: string | null;
  }>>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailSaveMessage, setEmailSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, submissionsRes, toursRes, settingsRes] = await Promise.all([
          api.get('/school/dashboard'),
          api.get('/school/inquiry-submissions').catch(() => ({ data: [] })),
          api.get('/school/tour-bookings').catch(() => ({ data: [] })),
          api.get('/school/settings').catch(() => ({ data: { adminEmail: '' } })),
        ]);
        setData(dashboardRes.data);
        setSubmissions(Array.isArray(submissionsRes.data) ? submissionsRes.data : []);
        setTourBookings(Array.isArray(toursRes.data) ? toursRes.data : []);
        setAdminEmail(settingsRes.data?.adminEmail || '');
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveAdminEmail = async () => {
    if (!adminEmail.trim()) {
      setEmailSaveMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }
    
    setSavingEmail(true);
    setEmailSaveMessage(null);
    try {
      await api.put('/school/settings', { adminEmail: adminEmail.trim() });
      setEmailSaveMessage({ type: 'success', text: 'Admin email saved successfully!' });
      setTimeout(() => setEmailSaveMessage(null), 5000);
    } catch (err: any) {
      setEmailSaveMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save admin email' });
    } finally {
      setSavingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <p className="text-slate-500 text-sm">{t('loading')}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">{t('unable_to_load_metrics')}</h3>
        <p className="text-slate-500 text-sm">{t('check_connection')}</p>
      </div>
    );
  }

  const { metrics, chartData, recentCalls } = data;

  return (
    <div className="animate-soft">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('dashboard')}</h1>
          <p className="text-sm text-slate-500">{t('dashboard_desc')}</p>
        </div>
        <button
          onClick={async () => {
            try {
              await api.post('/school/test-call');
              window.location.reload();
            } catch (err) {
              alert(t('test_call_failed'));
            }
          }}
          className="ui-button-primary gap-2"
        >
          <PlayCircle className="w-4 h-4" />
          {t('simulate_inquiry_call')}
        </button>
      </div>

      {/* Admin Email Configuration */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-slate-900">Admin Email Notification</h2>
            <p className="text-xs text-slate-500 mt-0.5">Receive email notifications when calls are received via webhook</p>
          </div>
        </div>
        {emailSaveMessage && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${emailSaveMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {emailSaveMessage.text}
          </div>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[300px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Admin Email Address</label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@school.com"
              className="ui-input text-sm py-2 w-full"
            />
            <p className="text-xs text-slate-400 mt-1">You will receive an email notification whenever a call transcript is received</p>
          </div>
          <button
            type="button"
            disabled={savingEmail}
            onClick={handleSaveAdminEmail}
            className="ui-button-primary gap-2 disabled:opacity-50"
          >
            {savingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {savingEmail ? 'Saving...' : 'Save Email'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      {/* Analytics Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-slate-400" />
          Call Volume (Last 14 Days)
        </h2>
        <div className="h-[300px] w-full">
          {chartData?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} minTickGap={20} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Line type="monotone" dataKey="calls" name="Total Calls" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No chart data available.
            </div>
          )}
        </div>
      </div>

      {/* Test SMS & Email - verify form link without making a call */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{t('test_followup_title')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('test_followup_desc')}</p>
          </div>
        </div>
        {testMessage && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${testMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {testMessage.text}
          </div>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[180px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">{t('recipient')} (SMS)</label>
            <input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder={t('test_followup_phone_placeholder')}
              className="ui-input text-sm py-2"
            />
          </div>
          <div className="min-w-[200px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">{t('email')}</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder={t('test_followup_email_placeholder')}
              className="ui-input text-sm py-2"
            />
          </div>
          <button
            type="button"
            disabled={testSending || (!testPhone.trim() && !testEmail.trim())}
            onClick={async () => {
              setTestMessage(null);
              setTestSending(true);
              try {
                const payload: { phone?: string; email?: string } = {};
                if (testPhone.trim()) payload.phone = testPhone.trim();
                if (testEmail.trim()) payload.email = testEmail.trim();
                const res = await api.post('/school/test-followup', payload);
                const msg = res.data?.message || t('test_followup_success');
                setTestMessage({ type: 'success', text: res.data?.partialErrors?.length ? `${msg} (${res.data.partialErrors.join('; ')})` : msg });
                setTimeout(() => setTestMessage(null), 8000);
              } catch (err: any) {
                const serverError = err.response?.data?.error;
                setTestMessage({ type: 'error', text: serverError || t('test_followup_error') });
              } finally {
                setTestSending(false);
              }
            }}
            className="ui-button-primary gap-2 disabled:opacity-50"
          >
            {testSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            {t('send_test_followup')}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-3">{t('test_followup_hint')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-slate-500" />
              {t('recent_calls')}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-500 text-xs font-medium border-b border-slate-100">
                  <th className="px-6 py-3">{t('caller')}</th>
                  <th className="px-6 py-3">{t('type')}</th>
                  <th className="px-6 py-3">{t('duration')}</th>
                  <th className="px-6 py-3 text-right">{t('time')}</th>
                  <th className="px-6 py-3 text-right">Recording</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="text-sm font-medium text-slate-900">{call.callerName}</div>
                      <div className="text-xs text-slate-500">{call.callerPhone}</div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`ui-badge ${call.callType === 'inquiry'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                        }`}>
                        {call.callType}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-700">
                      {Math.floor(call.duration / 60)}m {call.duration % 60}s
                    </td>
                    <td className="px-6 py-3 text-right text-xs text-slate-500">
                      {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {call.recordingUrl ? (
                        <a href={call.recordingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline">
                          <Mic className="w-3.5 h-3.5" /> Play
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              Recent form submissions
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {submissions.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500 text-sm">No form submissions yet.</div>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} className="px-6 py-3 hover:bg-slate-50/50 transition-colors">
                  <button
                    type="button"
                    className="w-full text-left flex items-center justify-between gap-2"
                    onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900">{sub.parentName || '—'}</div>
                      <div className="text-xs text-slate-500">{sub.email || sub.phone || 'No contact'}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400">
                        {new Date(sub.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {expandedId === sub.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {expandedId === sub.id && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5">
                      {sub.phone && (
                        <p className="text-xs text-slate-600"><span className="font-medium text-slate-500">Phone:</span> {sub.phone}</p>
                      )}
                      {sub.answers?.length > 0 && sub.answers.map((a, i) => (
                        <p key={i} className="text-xs text-slate-600"><span className="font-medium text-slate-500">{a.question}:</span> {a.value || '—'}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              Tour bookings
            </h2>
          </div>
          <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
            {tourBookings.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500 text-sm">No tours booked yet.</div>
            ) : (
              tourBookings.map((tour) => (
                <div key={tour.id} className="px-6 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="text-sm font-medium text-slate-900">{tour.parentName || '—'}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {new Date(tour.scheduledAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                  {(tour.phone || tour.email) && (
                    <div className="text-xs text-slate-400 mt-1">{tour.phone || tour.email}</div>
                  )}
                  {tour.calendarProvider && (
                    <span className="inline-block mt-1 text-xs text-emerald-600">
                      Added to {tour.calendarProvider === 'google' ? 'Google' : 'Outlook'} Calendar
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
