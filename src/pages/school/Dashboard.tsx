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
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all shrink-0 ${error ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'
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

    // Initial fetch
    fetchData();

    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchData();
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
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



      <div className="space-y-8">
        {/* Recent Calls - Full Width */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-primary-600" />
              {t('recent_calls')}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4 bg-slate-50/30">{t('caller')}</th>
                  <th className="px-6 py-4 bg-slate-50/30">{t('type')}</th>
                  <th className="px-6 py-4 bg-slate-50/30">{t('duration')}</th>
                  <th className="px-6 py-4 bg-slate-50/30">{t('time')}</th>
                  <th className="px-6 py-4 bg-slate-50/30 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCalls.map((call) => (
                  <React.Fragment key={call.id}>
                    <tr className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{call.callerName}</div>
                        <div className="text-xs text-slate-500 font-medium">{call.callerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${call.callType === 'inquiry'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                          {call.callType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-slate-300" />
                          {Math.floor(call.duration / 60)}m {call.duration % 60}s
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-600 tabular-nums">
                          {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                          {new Date(call.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {call.recordingUrl ? (
                          <button
                            onClick={() => setExpandedId(expandedId === call.id ? null : call.id)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-100"
                          >
                            <Mic className="w-3.5 h-3.5" />
                            {expandedId === call.id ? 'Close' : 'View Insights'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-bold italic">No Recording</span>
                        )}
                      </td>
                    </tr>
                    {expandedId === call.id && call.recordingUrl && (
                      <tr className="bg-slate-50/30 border-l-4 border-l-blue-500">
                        <td colSpan={5} className="px-8 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Mic className="w-3 h-3" /> Audio Playback
                              </p>
                              <AudioPlayer src={call.recordingUrl} />
                            </div>
                            {call.summary && (
                              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-900 mb-3 uppercase tracking-widest border-b border-slate-100 pb-2">AI Generated Insights</p>
                                <p className="text-sm text-slate-600 leading-relaxed italic font-medium">"{call.summary}"</p>
                                {call.tourBookingDetected && (
                                  <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Tour Booking Confirmed</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Call Transcript Summaries */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary-600" />
                Call Transcript Summaries
              </h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {callsWithSummaries.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-400 text-sm font-medium italic">No transcript summaries available yet.</div>
              ) : (
                callsWithSummaries.map((call) => (
                  <div key={call.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                    <button
                      type="button"
                      className="w-full text-left flex items-center justify-between gap-4"
                      onClick={() => setExpandedId(expandedId === call.id ? null : call.id)}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900">{call.callerName || 'Parent'}</div>
                        <div className="text-xs text-slate-500 font-medium">{call.callerPhone || 'Unknown'}</div>
                        {call.tourBookingDetected && (
                          <span className="inline-flex mt-1.5 text-[9px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                            Tour Booked
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-700">
                            {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">
                            {new Date(call.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        {expandedId === call.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>
                    {expandedId === call.id && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Detail Summary</p>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium italic">"{call.summary}"</p>
                        </div>
                        {call.tourBookingDate && (
                          <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                            <Calendar className="w-4 h-4 text-emerald-500" />
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-tighter opacity-70">Scheduled Tour</p>
                              <p className="text-xs font-bold whitespace-nowrap">
                                {new Date(call.tourBookingDate).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
                              </p>
                            </div>
                          </div>
                        )}
                        {call.conversationId && (
                          <p className="text-[9px] text-slate-400 font-mono tracking-tighter">REF: {call.conversationId}</p>
                        )}
                      </div>
                    )}
                  </div>
                )
                ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-600" />
                Scheduled Tours
              </h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {tourBookings.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-400 text-sm font-medium italic">No tours booked yet.</div>
              ) : (
                tourBookings.map((tour) => (
                  <div key={tour.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-bold text-slate-900">{tour.parentName || 'Anonymous Parent'}</div>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${tour.calendarProvider === 'google' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                        {tour.calendarProvider || 'Internal'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-xs font-semibold tabular-nums">
                        {new Date(tour.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    {(tour.phone || tour.email) && (
                      <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        {tour.phone && <span className="flex items-center gap-1"><PhoneCall className="w-2.5 h-2.5" /> {tour.phone}</span>}
                        {tour.email && <span className="flex items-center gap-1 underline underline-offset-2">@{tour.email}</span>}
                      </div>
                    )}
                  </div>
                )
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
