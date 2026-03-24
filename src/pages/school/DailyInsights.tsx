import React, { useEffect, useState, useRef } from 'react';
import {
  Loader2, AlertTriangle, Calendar, PhoneCall, Clock, User,
  MessageSquare, Star, ChevronDown, ChevronUp, Play, Pause,
  Headphones, Download, Baby, Lightbulb, CheckCircle2,
  Phone
} from 'lucide-react';
import api from '../../api/axios';

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
}

interface TodayTour {
  id: string;
  parentName: string;
  phone: string;
  email: string;
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
              className="h-1 bg-slate-200 rounded-full cursor-pointer relative"
              onClick={(e) => {
                if (!ref.current) return;
                const r = e.currentTarget.getBoundingClientRect();
                ref.current.currentTime = ((e.clientX - r.left) / r.width) * dur;
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

// ─── Main Component ───────────────────────────────────────────────────────────
export const DailyInsights = () => {
  const [needsAttention, setNeedsAttention] = useState<NeedsAttentionCall[]>([]);
  const [todaysTours, setTodaysTours] = useState<TodayTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
  const [expandedTour, setExpandedTour] = useState<string | null>(null);
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/school/daily-insights');
        setNeedsAttention(res.data.needsAttention || []);
        setTodaysTours(res.data.todaysTours || []);
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

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-amber-600" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Daily Insights</h1>
          </div>
          <p className="text-sm text-slate-500 ml-10">{today}</p>
        </div>
        <div className="flex items-center gap-3 ml-10 md:ml-0">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{needsAttention.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Need Attention</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{todaysTours.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tours Today</div>
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
            <p className="text-slate-700 font-semibold">All clear today!</p>
            <p className="text-slate-400 text-sm mt-1">No unbooked inquiries from today.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {needsAttention.map((call) => (
              <div
                key={call.id}
                className="bg-white border border-red-100 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* Call row */}
                <div className="px-5 py-4 flex items-center gap-4">
                  {/* Red icon */}
                  <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                    <PhoneCall className="w-4 h-4 text-red-600" />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
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
                  {/* Time + duration */}
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1 justify-end">
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
                    className="ml-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors shrink-0"
                  >
                    {expandedCall === call.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
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
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${call.callerPhone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <Phone className="w-3 h-3" /> Call Back
                      </a>
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
          <div className="space-y-4">
            {todaysTours.map((tour) => {
              const countdown = getCountdown(tour.scheduledAt);
              const isExpanded = expandedTour === tour.id;
              return (
                <div
                  key={tour.id}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden border transition-all hover:shadow-md ${countdown.past ? 'border-slate-200' : 'border-emerald-100'}`}
                >
                  {/* Coloured top stripe */}
                  <div className={`h-1 w-full ${countdown.past ? 'bg-slate-200' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`} />

                  <div className="px-5 py-4">
                    {/* Tour header row */}
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${countdown.past ? 'bg-slate-100' : 'bg-emerald-100'}`}>
                        <User className={`w-5 h-5 ${countdown.past ? 'text-slate-400' : 'text-emerald-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-slate-900">{tour.parentName || 'Parent'}</span>
                          {!countdown.past && (
                            <span className={`text-xs ${countdown.color} bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200`}>
                              {countdown.label}
                            </span>
                          )}
                          {countdown.past && (
                            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                              Completed
                            </span>
                          )}
                          {tour.calendarProvider && (
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${tour.calendarProvider === 'google' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                              {tour.calendarProvider}
                            </span>
                          )}
                        </div>
                        {/* Scheduled time */}
                        <div className="flex items-center gap-1.5 mt-1 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm font-semibold">
                            {new Date(tour.scheduledAt).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedTour(isExpanded ? null : tour.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors shrink-0 ml-auto"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Quick chips (always visible) */}
                    <div className="flex flex-wrap gap-2 mt-3 ml-14">
                      {tour.phone && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5">
                          <PhoneCall className="w-3 h-3" /> {tour.phone}
                        </span>
                      )}
                      {tour.email && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5">
                          @ {tour.email}
                        </span>
                      )}
                      {tour.childAge && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-2 py-0.5">
                          <Baby className="w-3 h-3" /> Child age: {tour.childAge}
                        </span>
                      )}
                      {tour.reminderSent && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Reminder sent
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-6 py-6 bg-white space-y-8">
                      
                      {/* 1. Purpose of Visit - More prominent but neutral */}
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Star className="w-3.5 h-3.5" /> Purpose of Visit
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
                          <p className="text-base font-bold text-slate-900 leading-tight">
                            {tour.reason || 'Enrollment Inquiry'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 2. Call Context (What Happened) */}
                        {tour.callSummary && (
                          <div className="animate-in fade-in slide-in-from-left-2 duration-400">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <PhoneCall className="w-3.5 h-3.5" /> Call Context
                            </p>
                            <div className="border border-slate-200 rounded-xl px-5 py-4 min-h-[100px]">
                              <p className="text-sm text-slate-600 leading-relaxed italic">
                                "{tour.callSummary}"
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 3. Child Details */}
                        <div className="animate-in fade-in slide-in-from-right-2 duration-400">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Baby className="w-3.5 h-3.5" /> Child Details
                          </p>
                          <div className="border border-slate-200 rounded-xl px-5 py-4 min-h-[100px] flex items-center">
                            {tour.childAge ? (
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Age / Grade</span>
                                <span className="text-xl font-bold text-slate-900">{tour.childAge}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400 italic">No age details recorded</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 4. Questions Asked */}
                      {tour.questionsAsked && tour.questionsAsked.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5" /> Questions They Asked
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {tour.questionsAsked.map((q, i) => (
                              <div key={i} className="flex items-start gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3.5 shadow-sm hover:border-slate-300 transition-colors">
                                <div className="w-6 h-6 bg-slate-100 text-slate-500 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {i + 1}
                                </div>
                                <p className="text-sm text-slate-700 font-medium leading-snug">{q}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 5. Additional Highlights & Notes */}
                      {tour.highlights && tour.highlights !== tour.callSummary && (
                        <div className="animate-in fade-in duration-700">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Lightbulb className="w-3.5 h-3.5" /> Additional Notes
                          </p>
                          <div className="rounded-xl px-5 py-4 border border-dashed border-slate-300">
                            <p className="text-sm text-slate-500 italic">
                              {tour.highlights}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Fallback */}
                      {!tour.callSummary && !tour.reason && tour.questionsAsked.length === 0 && (
                        <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                            <p className="text-sm text-slate-400 italic font-medium">
                                No additional call intelligence is currently linked to this tour.
                            </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
