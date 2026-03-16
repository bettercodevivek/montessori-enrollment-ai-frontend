import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, PlayCircle, Activity, PhoneCall, ChevronDown, ChevronUp, Calendar, Mic, TrendingUp, Play, Pause, Headphones, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MetricCard } from '../../components/MetricCard';
import { useRef } from 'react';
import api from '../../api/axios';

const AudioPlayer = ({ src }: { src: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current || error) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current || !progressBarRef.current || error) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));
    audioRef.current.currentTime = percentage * audioRef.current.duration;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-xl p-3 w-full ${error ? 'opacity-75' : ''}`}>
      <audio
        ref={audioRef} src={src}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            setLoading(false);
          }
        }}
        onCanPlay={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        onEnded={() => setIsPlaying(false)}
        hidden
      />

      <div className="flex items-center gap-3 mb-2">
        <button 
          onClick={togglePlay} 
          disabled={error || loading}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all shrink-0 ${
            error ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>
        <div className="flex-1">
          {error ? (
            <div className="h-6 flex items-center justify-center text-[10px] font-semibold text-red-500 bg-red-50 rounded italic">
              Recording unavailable or still processing
            </div>
          ) : (
            <>
              <div ref={progressBarRef} onClick={handleSeek} className="h-1.5 bg-slate-200 rounded-full cursor-pointer relative">
                <div className="absolute inset-y-0 left-0 bg-blue-500 rounded-full" style={{ width: `${progressPercentage}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] font-bold text-slate-400">{formatTime(currentTime)}</span>
                <span className="text-[10px] font-bold text-slate-400">{formatTime(duration)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Headphones className="w-3 h-3" />
          <span className="text-[8px] font-bold uppercase tracking-wider">
            {error ? 'Error loading audio' : 'Recording Console'}
          </span>
        </div>
        {!error && !loading && (
          <a href={src} download className="text-slate-400 hover:text-blue-600">
            <Download className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};

interface DashboardResponse {
  metrics: Array<{ label: string; value: number; change?: number }>;
  chartData: Array<{ name: string; calls: number; inquiries: number }>;
  recentCalls: Array<{
    id: string;
    conversationId?: string | null;
    callerName: string;
    callerPhone: string;
    callType: string;
    duration: number;
    timestamp: string;
    recordingUrl: string | null;
    summary?: string;
    tourBookingDetected?: boolean;
    tourBookingDate?: string | null;
    aiProcessed?: boolean;
  }>;

}

export const SchoolDashboard = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [, setSubmissions] = useState<Array<{
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


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, submissionsRes, toursRes] = await Promise.all([
          api.get('/school/dashboard'),
          api.get('/school/inquiry-submissions').catch(() => ({ data: [] })),
          api.get('/school/tour-bookings').catch(() => ({ data: [] })),
        ]);
        setData(dashboardRes.data);
        setSubmissions(Array.isArray(submissionsRes.data) ? submissionsRes.data : []);
        setTourBookings(Array.isArray(toursRes.data) ? toursRes.data : []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);



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
  
  // Get calls with transcript summaries
  const callsWithSummaries = recentCalls.filter(call => call.summary && call.summary.trim().length > 0);

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
                  <React.Fragment key={call.id}>
                    <tr className="hover:bg-slate-50/50 transition-colors">
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
                          <button 
                            onClick={() => setExpandedId(expandedId === call.id ? null : call.id)}
                            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
                          >
                            <Mic className="w-3.5 h-3.5" /> 
                            {expandedId === call.id ? 'Hide' : 'Play'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                    {expandedId === call.id && call.recordingUrl && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="max-w-md ml-auto">
                            <AudioPlayer src={call.recordingUrl} />
                          </div>
                          {call.summary && (
                            <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                              <p className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wider">Call Summary</p>
                              <p className="text-sm text-slate-600 leading-relaxed italic">"{call.summary}"</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call Transcript Summaries */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Mic className="w-4 h-4 text-slate-500" />
              Call Transcript Summaries
            </h2>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {callsWithSummaries.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500 text-sm">No transcript summaries available yet.</div>
            ) : (
              callsWithSummaries.map((call) => (
                <div key={call.id} className="px-6 py-3 hover:bg-slate-50/50 transition-colors">
                  <button
                    type="button"
                    className="w-full text-left flex items-center justify-between gap-2"
                    onClick={() => setExpandedId(expandedId === call.id ? null : call.id)}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">{call.callerName || 'Parent'}</div>
                      <div className="text-xs text-slate-500">{call.callerPhone || 'Unknown'}</div>
                      {call.tourBookingDetected && (
                        <span className="inline-block mt-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                          Tour Booked
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400">
                        {new Date(call.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {expandedId === call.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {expandedId === call.id && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-2">
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Summary:</p>
                        <p className="text-xs text-slate-700 leading-relaxed">{call.summary}</p>
                      </div>
                      {call.tourBookingDate && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Tour Scheduled:</p>
                          <p className="text-xs text-slate-700">
                            {new Date(call.tourBookingDate).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
                          </p>
                        </div>
                      )}
                      {call.conversationId && (
                        <p className="text-xs text-slate-400">Conversation ID: {call.conversationId}</p>
                      )}
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
