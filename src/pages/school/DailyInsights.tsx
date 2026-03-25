import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Loader2, AlertTriangle, Calendar, PhoneCall, Clock, User,
  MessageSquare, Star, ChevronDown, ChevronUp, Play, Pause,
  Headphones, Download, Baby, Lightbulb, CheckCircle2,
  Phone
} from 'lucide-react';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import cloud from 'd3-cloud';

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

const getTimeOfDayBucket = (d: Date) => {
  const h = d.getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

const splitSummaryIntoBullets = (text?: string) => {
  const raw = (text || '').trim();
  if (!raw) return [];
  return raw
    .split(/[.!?]+/g)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 4);
};

const STOPWORDS = new Set([
  'the', 'and', 'or', 'but', 'if', 'then', 'than', 'that', 'this', 'these', 'those',
  'a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'as', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'it', 'its', 'i', 'we', 'you', 'they', 'them',
  'your', 'our', 'ours', 'my', 'me', 'their', 'theirs', 'from', 'by', 'about', 'into',
  // Common verbs / filler
  'can', 'could', 'would', 'do', 'does', 'did', 'have', 'has', 'had', 'will', 'would',
  'what', 'how', 'when', 'where', 'why', 'please', 'tell', 'me', 'myself', 'also',
  'make', 'want', 'need', 'know', 'see', 'get', 'go', 'send', 'message',

  // Common nouns that tend to dominate phone transcripts
  'school', 'tour', 'schedule', 'scheduled', 'availability', 'room', 'rooms',
  'program', 'programs',
  'child', 'children', 'age', 'year', 'years',
  'phone', 'number', 'numbers', 'email', 'mail', 'gmail', 'com',

  // Names / internal tokens that frequently pollute word clouds
  'benny', 'nora', 'agent', 'sid', 'april', 'week', 'first', 'second', 'third',
  'contacted', 'contact', 'provided', 'initially', 'interention', 'intention',
  'clearly', 'something', 'speak', 'date', 'call', 'calls',

  // Generic connector words
  'theirs', 'ours', 'yours', 'his', 'hers', 'them', 'they',

  // Misc common transcript artifacts
  'sync', 'invite', 'calendar',
  'someone', 'somebody', 'anyone', 'everyone', 'n/a', 'na',
  'hello', 'hi', 'yeah', 'no', 'yes'
]);

const extractWordFrequencies = (inputs: string[]) => {
  const text = inputs
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    // Preserve a couple of common hyphenated tokens we expect in school questions
    .replace(/after[- ]school/g, 'after-school')
    .replace(/pre[- ]?k/g, 'pre-k')
    .replace(/after[- ]?school/g, 'after-school');

  const tokens = text
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z0-9\- ]/gi, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(Boolean);

  const freqs = new Map<string, number>();
  for (const token of tokens) {
    const t = token.trim();
    if (!t) continue;
    if (STOPWORDS.has(t)) continue;
    // Drop any digits-containing tokens (phone numbers, ids, years, etc.)
    if (/\d/.test(t)) continue;
    // Guard against very long tokens that make the cloud ugly
    if (t.length > 18) continue;
    // Keep hyphenated tokens like "after-school"
    if (t.length < 3 && !t.includes('-')) continue;
    freqs.set(t, (freqs.get(t) || 0) + 1);
  }

  return Array.from(freqs.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
};

// ─── Word Cloud (d3-cloud layout) ───────────────────────────────────────────
type WordCloudWord = { word: string; count: number };

const WordCloud = ({ words, height = 250 }: { words: WordCloudWord[]; height?: number }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ width: 600, height });
  const [layout, setLayout] = useState<
    Array<{ word: string; count: number; x: number; y: number; rotate: number; fontSize: number; }>
  >([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const cr = entry.contentRect;
      setBox({ width: Math.max(320, Math.floor(cr.width)), height: Math.max(200, height) });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [height]);

  useEffect(() => {
    if (!words || words.length === 0) {
      setLayout([]);
      return;
    }

    const maxCount = Math.max(...words.map(w => w.count), 1);
    const minFont = 12;
    const maxFont = 34;
    const getFontSize = (c: number) => {
      const t = Math.log2(c + 1) / Math.log2(maxCount + 1);
      return minFont + t * (maxFont - minFont);
    };

    // d3-cloud uses a deterministic-ish layout per run; we keep rotations mostly 0/90
    const layoutWords = words.slice(0, 40).map(w => ({
      text: w.word,
      count: w.count,
      size: getFontSize(w.count),
    }));

    const instance = (cloud as any)()
      .size([box.width, box.height])
      .words(layoutWords.map(w => ({ text: w.text, count: w.count, size: w.size })))
      .padding(3)
      .rotate(() => (Math.random() > 0.94 ? 90 : 0))
      .font('system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial')
      .fontSize((d: any) => d.size)
      .on('end', (out: any[]) => {
        const next = out.map((d: any) => ({
          word: d.text,
          count: d.count,
          x: d.x,
          y: d.y,
          rotate: d.rotate || 0,
          fontSize: d.size || 16,
        }));
        setLayout(next);
      });

    instance.start();
    // No cleanup needed; a new layout run will overwrite state.
  }, [words, box.width, box.height]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: box.height, position: 'relative', overflow: 'hidden' }}
    >
      {layout.map((w) => {
        const maxCount = Math.max(...words.map(x => x.count), 1);
        const t = Math.log2(w.count + 1) / Math.log2(maxCount + 1);
        const color = t > 0.75 ? '#047857' : t > 0.45 ? '#2563eb' : '#0f172a';
        return (
          <span
            key={`${w.word}-${w.count}-${w.x}-${w.y}`}
            style={{
              position: 'absolute',
              left: w.x + box.width / 2,
              top: w.y + box.height / 2,
              transform: `translate(-50%, -50%) rotate(${w.rotate}deg)`,
              fontSize: w.fontSize,
              fontWeight: 700,
              color,
              whiteSpace: 'nowrap',
              textShadow: '0 1px 0 rgba(0,0,0,0.02)',
              userSelect: 'none',
            }}
            title={`${w.word}: ${w.count}`}
          >
            {w.word.charAt(0).toUpperCase() + w.word.slice(1)}
          </span>
        );
      })}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const DailyInsights = () => {
  const [needsAttention, setNeedsAttention] = useState<NeedsAttentionCall[]>([]);
  const [todaysTours, setTodaysTours] = useState<TodayTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
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

  // Derived UI values must be computed unconditionally (before any early return),
  // otherwise React will throw "Rendered more hooks than during the previous render".
  const totalToursToday = todaysTours.length;
  const actionNeededToday = needsAttention.length;

  const wordCloudWords = useMemo(() => {
    // Pull from every available text source for the richest cloud
    const allTexts: string[] = [
      // Tour questions asked during calls
      ...todaysTours.flatMap(t => t.questionsAsked || []),
      // Tour call summaries
      ...todaysTours.map(t => t.callSummary || '').filter(Boolean),
      // Tour highlights / notes
      ...todaysTours.map(t => t.highlights || '').filter(Boolean),
      // Needs-attention call summaries (parents who didn't book)
      ...needsAttention.map(n => n.summary || '').filter(Boolean),
      // Needs-attention questions if present
      ...needsAttention.flatMap(n => n.questionsAsked || []),
    ];

    const freqs = extractWordFrequencies(allTexts);

    // On sparse days (few calls) lower the threshold so we still show something
    const minCount = freqs.some(w => w.count >= 2) ? 2 : 1;
    const filtered = freqs.filter(w => w.count >= minCount);
    const chosen = (filtered.length >= 5 ? filtered : freqs).slice(0, 30);
    return chosen;
  }, [todaysTours, needsAttention]);

  const callTimingData = useMemo(() => {
    const counts: Record<'Morning' | 'Afternoon' | 'Evening', number> = {
      Morning: 0,
      Afternoon: 0,
      Evening: 0
    };

    for (const n of needsAttention) {
      const bucket = getTimeOfDayBucket(new Date(n.timestamp));
      counts[bucket as keyof typeof counts] += 1;
    }

    for (const t of todaysTours) {
      const bucket = getTimeOfDayBucket(new Date(t.scheduledAt));
      counts[bucket as keyof typeof counts] += 1;
    }

    return (['Morning', 'Afternoon', 'Evening'] as const).map(name => ({
      name,
      count: counts[name],
    }));
  }, [needsAttention, todaysTours]);

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
              <div className="text-2xl font-bold text-red-600">{actionNeededToday}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action Needed Today</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{totalToursToday}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tours Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 0: Word Cloud + Call Timing ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Word Cloud: Common Parent Questions
            </h2>
            {wordCloudWords.length > 0 && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-1 rounded">
                Top {Math.min(30, wordCloudWords.length)}
              </span>
            )}
          </div>

          {wordCloudWords.length === 0 ? (
            <div className="text-center text-slate-400 text-sm italic bg-slate-50/50 border border-dashed border-slate-200 rounded-xl px-4 py-10">
              Not enough transcript data yet to build a word cloud.
            </div>
          ) : (
            <div className="pt-1">
              <WordCloud words={wordCloudWords} height={220} />
              <div className="mt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Top Questions
                </p>
                <ul className="space-y-1">
                  {wordCloudWords.slice(0, 10).map((w) => (
                    <li key={`${w.word}-${w.count}`} className="text-sm text-slate-700 flex items-center justify-between gap-3">
                      <span className="font-semibold">
                        {w.word.charAt(0).toUpperCase() + w.word.slice(1)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {w.count}x
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Call Timing Insights
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-1 rounded">
              Today
            </span>
          </div>

          <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={callTimingData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Morning: {callTimingData.find(x => x.name === 'Morning')?.count || 0}</span>
            <span>Afternoon: {callTimingData.find(x => x.name === 'Afternoon')?.count || 0}</span>
            <span>Evening: {callTimingData.find(x => x.name === 'Evening')?.count || 0}</span>
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
                        {/* Visible child fields (no expand/collapse) */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5">
                            <User className="w-3 h-3 text-slate-400" /> Child: {tour.childName || 'N/A'}
                          </span>
                          {tour.childAge && (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-2 py-0.5">
                              <Baby className="w-3 h-3" /> Child age: {tour.childAge}
                            </span>
                          )}
                        </div>
                      </div>
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
                      {tour.reminderSent && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Reminder sent
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
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
                        {(tour.callSummary || tour.reason || tour.highlights) && (
                          <div className="animate-in fade-in slide-in-from-left-2 duration-400">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <PhoneCall className="w-3.5 h-3.5" /> Call Context
                            </p>
                            <div className="border border-slate-200 rounded-xl px-5 py-4 min-h-[100px]">
                              {splitSummaryIntoBullets(tour.callSummary || tour.highlights || tour.reason).length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 leading-relaxed">
                                  {splitSummaryIntoBullets(tour.callSummary || tour.highlights || tour.reason).map((b, i) => (
                                    <li key={i} className="italic">{b}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-slate-600 leading-relaxed italic">
                                  {tour.callSummary || tour.highlights || tour.reason}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 3. Child Details */}
                        <div className="animate-in fade-in slide-in-from-right-2 duration-400">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Baby className="w-3.5 h-3.5" /> Child Details
                          </p>
                          <div className="border border-slate-200 rounded-xl px-5 py-4 min-h-[100px] flex items-center">
                            <div className="space-y-1">
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Child Name</span>
                                <span className="text-base font-bold text-slate-900">{tour.childName || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Child Age</span>
                                <span className="text-xl font-bold text-slate-900">{tour.childAge || 'N/A'}</span>
                              </div>
                            </div>
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
