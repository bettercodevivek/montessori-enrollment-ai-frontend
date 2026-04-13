import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Loader2, AlertTriangle, Calendar, PhoneCall, Clock, User,
  MessageSquare, Star, ChevronDown, ChevronUp, Play, Pause,
  Headphones, Download, Baby, Lightbulb, CheckCircle2,
  Check, X
} from 'lucide-react';
import api from '../../api/axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
interface NeedsAttentionCall {
  id: string;
  conversationId: string | null;
  callerName: string;
  callerPhone: string;
  summary: string;
  timestamp: string;
  recordingUrl: string | null;
  duration: number;
  questionsAsked?: string[];
  actionTakenFeedback?: string;
  actionTakenAt?: string;
  feedbackHistory?: Array<{ feedback: string; timestamp: string }>;
}

interface TodayTour {
  id: string;
  parentName: string;
  phone: string;
  email: string;
  childName: string;
  childAge: string;
  reason: string;
  scheduledAt: string;
  calendarProvider: string | null;
  questionsAsked: string[];
  highlights: string;
  callSummary: string;
  reminderSent: boolean;
}

// ─── Mini Audio Player ────────────────────────────────────────────────────────
const MiniPlayer = ({ src }: { src: string }) => {
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLAudioElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const scrubbingRef = useRef(false);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!ref.current || err) return;
    playing ? ref.current.pause() : ref.current.play();
    setPlaying(!playing);
  };

  const fmt = (t: number) => {
    if (isNaN(t)) return '0:00';
    return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  };

  const pct = dur > 0 ? (time / dur) * 100 : 0;
  const seekToClientX = (clientX: number) => {
    if (!ref.current || !barRef.current || err) return;
    const r = barRef.current.getBoundingClientRect();
    ref.current.currentTime = ((clientX - r.left) / (r.width || 1)) * dur;
  };

  return (
    <div className={`flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 ${err ? 'opacity-60' : ''}`}>
      <audio
        ref={ref} src={src} hidden
        onTimeUpdate={() => ref.current && setTime(ref.current.currentTime)}
        onLoadedMetadata={() => { if (ref.current) { setDur(ref.current.duration); setLoading(false); } }}
        onCanPlay={() => setLoading(false)}
        onError={() => { setErr(true); setLoading(false); }}
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={toggle}
        disabled={err || loading}
        className={`w-7 h-7 flex items-center justify-center rounded-md shrink-0 transition-all ${err ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        {err ? (
          <p className="text-[10px] text-red-500 italic font-medium">Recording unavailable</p>
        ) : (
          <>
            <div
              ref={barRef}
              className="h-1 bg-slate-200 rounded-full cursor-pointer relative touch-none"
              role="slider"
              aria-label="Seek audio"
              aria-valuemin={0}
              aria-valuemax={Math.max(0, Math.floor(dur))}
              aria-valuenow={Math.max(0, Math.floor(time))}
              onPointerDown={(e) => {
                e.stopPropagation();
                if (err || loading) return;
                scrubbingRef.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                seekToClientX(e.clientX);
              }}
              onPointerMove={(e) => {
                if (!scrubbingRef.current) return;
                e.stopPropagation();
                seekToClientX(e.clientX);
              }}
              onPointerUp={(e) => {
                if (!scrubbingRef.current) return;
                e.stopPropagation();
                scrubbingRef.current = false;
                try {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                } catch {
                  // ignore
                }
              }}
            >
              <div className="absolute inset-y-0 left-0 bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between mt-0.5">
              <span className="text-[9px] font-bold text-slate-400">{fmt(time)}</span>
              <span className="text-[9px] font-bold text-slate-400">{fmt(dur)}</span>
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-slate-300 shrink-0">
        <Headphones className="w-3 h-3" />
        {!err && !loading && (
          <a href={src} download onClick={e => e.stopPropagation()} className="hover:text-blue-500 transition-colors">
            <Download className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};

// ─── Countdown helper ─────────────────────────────────────────────────────────
const getCountdown = (scheduledAt: string) => {
  const diff = new Date(scheduledAt).getTime() - Date.now();
  if (diff < 0) return { label: 'Passed', color: 'text-slate-400', past: true };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h === 0 && m < 30) return { label: `In ${m}m`, color: 'text-red-600 font-bold', past: false };
  if (h === 0) return { label: `In ${m}m`, color: 'text-amber-600 font-semibold', past: false };
  return { label: `In ${h}h ${m}m`, color: 'text-emerald-600 font-semibold', past: false };
};

const getTimeOfDayBucket = (d: Date) => {
  const h = d.getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

// ─── Word Cloud (stable tag cloud) ───────────────────────────────────────────
type WordCloudWord = { word: string; count: number; examples?: string[] };

const TagCloud = ({ words }: { words: WordCloudWord[] }) => {
  if (!words || words.length === 0) return null;

  const maxCount = Math.max(...words.map(w => w.count), 1);
  const fontSizeFor = (c: number) => {
    const t = Math.log2(c + 1) / Math.log2(maxCount + 1);
    return Math.round(12 + t * 18); // 12 -> 30px
  };
  const classFor = (c: number) => {
    const t = Math.log2(c + 1) / Math.log2(maxCount + 1);
    return t > 0.75 ? 'text-emerald-700' : t > 0.45 ? 'text-blue-700' : 'text-slate-800';
  };

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-3 leading-none">
      {words.slice(0, 25).map(w => (
        <span
          key={`${w.word}-${w.count}`}
          className={`${classFor(w.count)} font-extrabold tracking-tight select-none`}
          style={{ fontSize: fontSizeFor(w.count) }}
          title={(w.examples && w.examples.length > 0)
            ? `${w.word}\n- ${w.examples.join('\n- ')}`
            : `${w.word}`}
        >
          {w.word}
        </span>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const DailyInsights = () => {
  const [needsAttention, setNeedsAttention] = useState<NeedsAttentionCall[]>([]);
  const [todaysTours, setTodaysTours] = useState<TodayTour[]>([]);
  const [wordCloud, setWordCloud] = useState<WordCloudWord[]>([]);
  const [todayCalls, setTodayCalls] = useState<{ id: string; timestamp: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
  const [showWordCloud, setShowWordCloud] = useState(false);
  const [wordCloudLoading, setWordCloudLoading] = useState(false);
  const [, setNow] = useState(Date.now());
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [markingAction, setMarkingAction] = useState<Record<string, boolean>>({});
  const [closeConfirm, setCloseConfirm] = useState<string | null>(null);

  const handleShowWordCloud = async () => {
    setWordCloudLoading(true);

    // If we already have it from the daily-insights initial load, just show it
    if (wordCloud && wordCloud.length > 0) {
      setTimeout(() => {
        setWordCloudLoading(false);
        setShowWordCloud(true);
      }, 500);
      return;
    }

    // Otherwise, we explicitly ask the backend to generate/fetch it
    try {
      const res = await api.post('/school/wordcloud/generate');
      setWordCloud(res.data.wordCloud || []);
      setShowWordCloud(true);
    } catch (err) {
      console.error(err);
      setShowWordCloud(true); // show empty state or error
    } finally {
      setWordCloudLoading(false);
    }
  };

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        // Load all action-needed items (not just today's)
        const actionRes = await api.get('/school/action-needed');
        setNeedsAttention(actionRes.data.actionNeeded || []);
        
        // Load today's tours and other data
        const res = await api.get('/school/daily-insights');
        setTodaysTours(res.data.todaysTours || []);
        setWordCloud(res.data.wordCloud || []);
        setTodayCalls(res.data.todayCalls || []);
      } catch (err) {
        console.error('Failed to load daily insights:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkActionTaken = async (callId: string) => {
    setMarkingAction(prev => ({ ...prev, [callId]: true }));
    try {
      const feedback = feedbackInputs[callId] || '';
      await api.post(`/school/action-needed/${callId}/mark-action-taken`, {
        feedback
      });
      
      // Update the local state to append the feedback to history
      setNeedsAttention(prev => prev.map(call => 
        call.id === callId 
          ? { 
              ...call, 
              actionTakenFeedback: feedback,
              actionTakenAt: new Date().toISOString(),
              feedbackHistory: [
                ...(call.feedbackHistory || []),
                { feedback, timestamp: new Date().toISOString() }
              ]
            }
          : call
      ));
      
      // Clear the feedback input after submission
      setFeedbackInputs(prev => ({ ...prev, [callId]: '' }));
      
      console.log('Action marked as taken successfully');
    } catch (err) {
      console.error('Failed to mark action as taken:', err);
    } finally {
      setMarkingAction(prev => ({ ...prev, [callId]: false }));
    }
  };

  const handleCloseCard = (callId: string) => {
    setCloseConfirm(callId);
  };

  const confirmCloseCard = async () => {
    if (closeConfirm) {
      try {
        await api.delete(`/school/action-needed/${closeConfirm}`);
      } catch (err) {
        console.error('Failed to delete from server:', err);
        // Silently ignore server errors
      }
      // Always remove from local state
      setNeedsAttention(prev => prev.filter(call => call.id !== closeConfirm));
      setCloseConfirm(null);
    }
  };

  const cancelCloseCard = () => {
    setCloseConfirm(null);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Derived UI values must be computed unconditionally (before any early return),
  // otherwise React will throw "Rendered more hooks than during the previous render".
  const totalToursToday = todaysTours.length;
  const actionNeededToday = needsAttention.length;

  const wordCloudWords: WordCloudWord[] = useMemo(() => {
    return wordCloud || [];
  }, [wordCloud]);

  const callTimingData = useMemo(() => {
    const counts: Record<'Morning' | 'Afternoon' | 'Evening', number> = {
      Morning: 0,
      Afternoon: 0,
      Evening: 0
    };

    for (const c of todayCalls) {
      const bucket = getTimeOfDayBucket(new Date(c.timestamp));
      counts[bucket as keyof typeof counts] += 1;
    }

    return (['Morning', 'Afternoon', 'Evening'] as const).map(name => ({
      name,
      count: counts[name],
    }));
  }, [todayCalls]);

  const totalCallsToday = callTimingData.reduce((acc, x) => acc + x.count, 0);
  const donutData = totalCallsToday > 0
    ? callTimingData
    : [
      { name: 'Morning', count: 0 },
      { name: 'Afternoon', count: 0 },
      { name: 'Evening', count: 0 },
    ];

  const DONUT_COLORS: Record<string, string> = {
    Morning: '#34d399',   // emerald-400
    Afternoon: '#60a5fa', // blue-400
    Evening: '#f59e0b',   // amber-500
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-slate-500 text-sm">Loading daily insights…</p>
      </div>
    );
  }

  return (
    <div className="animate-soft space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-amber-600" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Daily Insights</h1>
          </div>
          <p className="text-sm text-slate-500 md:ml-10">{today}</p>
        </div>
        <div className="flex items-center gap-6 md:ml-10 lg:ml-0">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 tabular-nums">{actionNeededToday}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action Needed</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 tabular-nums">{totalToursToday}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tours Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 0: Word Cloud + Call Timing ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Word Cloud: Common Parent Questions
            </h2>
            {showWordCloud && wordCloudWords.length > 0 && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-1 rounded">
                Top {Math.min(30, wordCloudWords.length)}
              </span>
            )}
          </div>

          {!showWordCloud ? (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl h-full min-h-[250px]">
              {wordCloudLoading ? (
                <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-blue-500 text-white p-3 rounded-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-slate-700">Analyzing Transcripts...</div>
                    <div className="text-xs text-slate-500 mt-1">Extracting themes</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center -mb-2">
                    <MessageSquare className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-sm text-slate-500 text-center max-w-[250px]">
                    See what parents are talking about most today in their inquiries.
                  </p>
                  <button
                    onClick={handleShowWordCloud}
                    className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-blue-700 hover:shadow transition-all active:scale-95"
                  >
                    Get Word Cloud
                  </button>
                </div>
              )}
            </div>
          ) : wordCloudWords.length === 0 ? (
            <div className="text-center text-slate-400 text-sm italic bg-slate-50/50 border border-dashed border-slate-200 rounded-xl px-4 py-10">
              Not enough transcript data yet to build a word cloud.
            </div>
          ) : (
            <div className="pt-1 animate-in fade-in duration-500 slide-in-from-bottom-2">
              <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-4">
                <TagCloud words={wordCloudWords} />
              </div>

              <div className="mt-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Top Topics (with example questions)
                </p>
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                  {wordCloudWords.slice(0, 5).map((w) => (
                    <div
                      key={`${w.word}-${w.count}`}
                      className="flex items-start justify-between gap-4 bg-white border border-slate-100 rounded-lg px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-slate-900">
                          {w.word}
                        </div>
                        {Array.isArray(w.examples) && w.examples.length > 0 && (
                          <ul className="mt-1 space-y-1 text-xs text-slate-600">
                            {w.examples.slice(0, 2).map((ex: string, i: number) => (
                              <li key={i} className="leading-snug">
                                - {ex}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Call Timing Insights
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-1 rounded">
              Today
            </span>
          </div>

          <div className="w-full h-[280px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={98}
                  paddingAngle={2}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {donutData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={DONUT_COLORS[entry.name] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value}`, `${name}`]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                {totalCallsToday}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Calls Today
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Morning: {callTimingData.find(x => x.name === 'Morning')?.count || 0}</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400" /> Afternoon: {callTimingData.find(x => x.name === 'Afternoon')?.count || 0}</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> Evening: {callTimingData.find(x => x.name === 'Evening')?.count || 0}</span>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Peak Activity Insight</p>
            <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-3">
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                {totalCallsToday === 0
                  ? "No calls recorded today yet. Insights will appear as parents call."
                  : `Most parents are calling during the ${callTimingData.reduce((prev, current) => (prev.count > current.count) ? prev : current).name.toLowerCase()}. Ensure staff is available for follow-ups then.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 1: Needs Attention ─────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h2 className="text-base font-bold text-slate-900">Inquiries Needing Attention</h2>
          {needsAttention.length > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold border border-red-200">
              {needsAttention.length}
            </span>
          )}
        </div>

        {needsAttention.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold">All clear!</p>
            <p className="text-slate-400 text-sm mt-1">No action-needed inquiries from the last 30 days.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {needsAttention.map((call) => (
              <div
                key={call.id}
                className="bg-white border border-red-100 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* Call row */}
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Red icon */}
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                      <PhoneCall className="w-4 h-4 text-red-600" />
                    </div>
                    {/* Info for mobile - stacked */}
                    <div className="sm:hidden flex-1 min-w-0">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{call.callerName}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500 font-medium">{call.callerPhone}</span>
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[9px] font-bold uppercase tracking-wider border border-red-200">
                            No Tour
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Info for desktop */}
                  <div className="hidden sm:block flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">{call.callerName}</span>
                      <span className="text-xs text-slate-500 font-medium">{call.callerPhone}</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[9px] font-bold uppercase tracking-wider border border-red-200">
                        No Tour Booked
                      </span>
                    </div>
                    {call.summary && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">"{call.summary}"</p>
                    )}
                  </div>

                  {/* Mobile summary snippet */}
                  <div className="sm:hidden">
                    {call.summary && (
                      <p className="text-xs text-slate-500 line-clamp-2 italic">"{call.summary}"</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1 sm:justify-end">
                        <Clock className="w-3 h-3 text-slate-300" />
                        {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {Math.floor(call.duration / 60)}m {call.duration % 60}s
                      </div>
                    </div>
                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedCall(expandedCall === call.id ? null : call.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors shrink-0"
                    >
                      {expandedCall === call.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {expandedCall === call.id && (
                  <div className="px-5 pb-5 pt-2 border-t border-red-50 space-y-4 bg-red-50/30">
                    {call.recordingUrl && (
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Headphones className="w-3 h-3" /> Recording
                        </p>
                        <MiniPlayer src={call.recordingUrl} />
                      </div>
                    )}
                    {call.summary && (
                      <div className="bg-white rounded-lg border border-red-100 p-4">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">What Happened</p>
                        <p className="text-sm text-slate-700 leading-relaxed italic">"{call.summary}"</p>
                      </div>
                    )}
                    {call.feedbackHistory && call.feedbackHistory.length > 0 && (
                      <div className="bg-emerald-50 rounded-lg border border-emerald-100 p-4">
                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <Check className="w-3 h-3" /> Action History ({call.feedbackHistory.length})
                        </p>
                        <div className="space-y-3">
                          {call.feedbackHistory
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map((entry, index) => (
                              <div key={index} className="bg-white rounded-lg border border-emerald-200 p-3">
                                <p className="text-sm text-emerald-800 leading-relaxed">{entry.feedback}</p>
                                <p className="text-[10px] text-emerald-600 mt-1">
                                  {new Date(entry.timestamp).toLocaleString()}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    {closeConfirm === call.id && (
                      <div className="bg-slate-100 rounded-lg border border-slate-200 p-4">
                        <h4 className="text-sm font-bold text-slate-900 mb-2">Close this card?</h4>
                        <p className="text-xs text-slate-600 mb-3">Are you sure you want to remove this card from the list?</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={cancelCloseCard}
                            className="flex-1 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                            type="button"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={confirmCloseCard}
                            className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer"
                            type="button"
                          >
                            Yes, Close
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-red-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Add New Feedback</p>
                      <div className="flex gap-2">
                        <textarea
                          value={feedbackInputs[call.id] || ''}
                          onChange={(e) => setFeedbackInputs(prev => ({ ...prev, [call.id]: e.target.value }))}
                          placeholder="Write feedback about action taken..."
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs resize-none h-20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => handleMarkActionTaken(call.id)}
                          disabled={markingAction[call.id]}
                          className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          {markingAction[call.id] ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3" />
                              Submit
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleCloseCard(call.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-600 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors"
                        >
                          <X className="w-3 h-3" /> Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 2: Today's Tours ───────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">Today's Scheduled Tours</h2>
          {todaysTours.length > 0 && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200">
              {todaysTours.length}
            </span>
          )}
        </div>

        {todaysTours.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold">No tours today</p>
            <p className="text-slate-400 text-sm mt-1">Check back later or look at upcoming bookings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
            {todaysTours.map((tour) => {
              const countdown = getCountdown(tour.scheduledAt);
              return (
                <div
                  key={tour.id}
                  className={`bg-white rounded-2xl shadow-sm overflow-hidden border transition-all hover:shadow-md h-full ${countdown.past ? 'border-slate-200' : 'border-emerald-100'}`}
                >
                  {/* Coloured top stripe */}
                  <div className={`h-1 w-full ${countdown.past ? 'bg-slate-200' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Tour Time
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-slate-900">
                          <Clock className="w-4 h-4 text-slate-300" />
                          <span className="text-sm font-bold tabular-nums">
                            {new Date(tour.scheduledAt).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {!countdown.past ? (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border bg-emerald-50 border-emerald-200 ${countdown.color}`}>
                            {countdown.label}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full border bg-slate-50 border-slate-200 text-slate-500">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Child
                          </div>
                          <div className="text-sm font-bold text-slate-900">
                            {tour.childName ? `Child: ${tour.childName}` : 'Child: N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Baby className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Child age
                          </div>
                          <div className="text-sm font-bold text-slate-900">
                            {tour.childAge ? `Child age: ${tour.childAge}` : 'Child age: N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Star className="w-3.5 h-3.5 text-amber-500" /> Purpose of visit
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-800 line-clamp-3">
                          {tour.reason || 'Enrollment inquiry'}
                        </div>
                        
                        {/* Display important insights/questions asked */}
                        {(tour.questionsAsked && tour.questionsAsked.length > 0) && (
                          <div className="mt-3 space-y-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Important Insights ({tour.questionsAsked.length})
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {tour.questionsAsked.map((question, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-[10px] font-medium"
                                >
                                  {index + 1}. {question}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Display highlights if available */}
                        {tour.highlights && tour.highlights.trim() && (
                          <div className="mt-3">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Additional Notes
                            </div>
                            <div className="mt-1 text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-2 border border-slate-100">
                              {tour.highlights}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
