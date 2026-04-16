import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Loader2, AlertTriangle, Calendar, Clock,
  Star, ChevronDown, ChevronUp, Play, Pause,
  Headphones, Download, CheckCircle2,
  Check, X
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
  questionsAsked?: string[];
  actionTakenFeedback?: string;
  actionTakenAt?: string;
  feedbackHistory?: Array<{ feedback: string; timestamp: string }>;
  tags?: string[];
  childName?: string;
  childAge?: string;
  language?: string;
  missingDetails?: string[];
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

// ─── Main Component ───────────────────────────────────────────────────────────
export const DailyInsights = () => {
  const [needsAttention, setNeedsAttention] = useState<NeedsAttentionCall[]>([]);
  const [todaysTours, setTodaysTours] = useState<TodayTour[]>([]);
  const [todayCalls, setTodayCalls] = useState<{ id: string; timestamp: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
  const [, setNow] = useState(Date.now());
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [markingAction, setMarkingAction] = useState<Record<string, boolean>>({});
  const [closeConfirm, setCloseConfirm] = useState<string | null>(null);


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

  // Calculate call timing buckets from actual todayCalls data
  const callTimingData = useMemo(() => {
    const counts: Record<'Morning' | 'Afternoon' | 'Evening', number> = {
      Morning: 0,
      Afternoon: 0,
      Evening: 0
    };

    todayCalls.forEach(call => {
      const callDate = new Date(call.timestamp);
      const hour = callDate.getHours();
      
      if (hour < 12) {
        counts.Morning++;
      } else if (hour >= 12 && hour < 15) {
        counts.Afternoon++;
      } else {
        counts.Evening++;
      }
    });

    return counts;
  }, [todayCalls]);

  // Determine peak call time
  const peakCallTime = useMemo(() => {
    const counts = callTimingData;
    const maxCount = Math.max(counts.Morning, counts.Afternoon, counts.Evening);
    
    if (maxCount === 0) return 'No calls today';
    
    if (counts.Morning === maxCount) return 'Morning';
    if (counts.Afternoon === maxCount) return 'Afternoon';
    return 'Evening';
  }, [callTimingData]);

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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Daily Insights</h1>
        <p className="text-sm text-slate-500">{today} • Good morning — here's what needs your attention today</p>
      </div>

      {/* Top Row Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {/* CALLS TODAY */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CALLS TODAY</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{todayCalls.length}</div>
          <div className="text-xs text-slate-500 mt-1">Since midnight</div>
        </div>

        {/* ACTION NEEDED */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ACTION NEEDED</div>
          <div className="text-2xl font-bold text-red-600 tabular-nums">{needsAttention.length}</div>
          <div className="text-xs text-slate-500 mt-1">No tour booked</div>
        </div>

        {/* TOURS TODAY */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">TOURS TODAY</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{todaysTours.length}</div>
          <div className="text-xs text-slate-500 mt-1">
            {todaysTours.length > 0 
              ? `${new Date(todaysTours[0].scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Completed`
              : 'No tours'
            }
          </div>
        </div>

        {/* PEAK CALL TIME */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PEAK CALL TIME</div>
          <div className="text-2xl font-bold text-slate-900">{peakCallTime}</div>
          <div className="text-xs text-slate-500 mt-1">
            {todayCalls.length > 0 ? 'Staff available then?' : 'No calls today'}
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Inquiries Needing Attention */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="text-base font-bold text-slate-900">INQUIRIES NEEDING ATTENTION</h2>
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
              {needsAttention.map((call) => {
                // Get initials from caller name
                const initials = call.callerName
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);
                
                return (
                  <div
                    key={call.id}
                    className="bg-white border border-red-100 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md"
                  >
                    {/* Call row */}
                    <div className="px-5 py-4">
                      <div className="flex items-start gap-4">
                        {/* Initials avatar */}
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-blue-700">{initials}</span>
                        </div>
                        
                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                          {/* Name and phone */}
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="text-sm font-bold text-slate-900">{call.callerName}</span>
                            {call.callerPhone && (
                              <span className="text-xs text-slate-500">{call.callerPhone}</span>
                            )}
                          </div>
                          
                          {/* Tags */}
                          {call.tags && call.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {call.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${
                                    tag.toLowerCase().includes('hot lead') 
                                      ? 'bg-amber-100 text-amber-700 border-amber-200' 
                                      : tag.toLowerCase().includes('partial call')
                                      ? 'bg-orange-100 text-orange-700 border-orange-200'
                                      : tag.toLowerCase().includes('urgency')
                                      ? 'bg-red-100 text-red-700 border-red-200'
                                      : tag.toLowerCase().includes('no child info')
                                      ? 'bg-purple-100 text-purple-700 border-purple-200'
                                      : 'bg-blue-100 text-blue-700 border-blue-200'
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Description */}
                          {call.summary && (
                            <p className="text-xs text-slate-600 line-clamp-2 mb-2">{call.summary}</p>
                          )}
                          
                          {/* Child info, language, missing details */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-2">
                            {call.childName && (
                              <span>Child: {call.childName}{call.childAge && ` (${call.childAge})`}</span>
                            )}
                            {call.language && (
                              <span>Language: {call.language}</span>
                            )}
                          </div>
                          
                          {call.missingDetails && call.missingDetails.length > 0 && (
                            <div className="text-xs text-amber-600 mb-2">
                              Missing: {call.missingDetails.join(', ')}
                            </div>
                          )}
                          
                          {/* Duration and time */}
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span>{Math.floor(call.duration / 60)}m {call.duration % 60}s</span>
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
                        <div className="border border-slate-200 p-4">
                          <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">
                            Action History ({call.feedbackHistory.length})
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-3 max-h-40 overflow-y-auto">
                            {call.feedbackHistory
                              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                              .map((entry, index) => (
                                <div key={index} className="text-xs text-slate-700 leading-relaxed border-b border-slate-200 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0 font-mono">
                                  [{new Date(entry.timestamp).toLocaleString()}] {entry.feedback}
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
                          <div className="flex flex-col gap-2">
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
                            <button
                              onClick={() => handleCloseCard(call.id)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-slate-600 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors"
                            >
                              <X className="w-3 h-3" /> Close
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Tours/Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Today's Tours Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">TODAY'S TOURS</h3>
            </div>
            <div className="text-xs text-slate-500 mb-3">{todaysTours.length} scheduled</div>
            
            {todaysTours.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500">No upcoming tours scheduled today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysTours.map((tour) => (
                  <div key={tour.id} className="border border-slate-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-bold text-slate-900">
                        {new Date(tour.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <div className="font-semibold">{tour.parentName}</div>
                      <div className="mt-1">{tour.childName} • {tour.childAge}</div>
                      <div className="mt-1 text-slate-500">{tour.reason || 'Enrollment inquiry'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Call Timing Today Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">CALL TIMING TODAY</h3>
            </div>
            {todayCalls.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500">No calls today</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600">Morning</span>
                    <span className="font-bold text-slate-900">{callTimingData.Morning}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full" 
                      style={{ width: `${todayCalls.length > 0 ? (callTimingData.Morning / todayCalls.length) * 100 : 0}%` }} 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600">Afternoon</span>
                    <span className="font-bold text-slate-900">{callTimingData.Afternoon}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-400 rounded-full" 
                      style={{ width: `${todayCalls.length > 0 ? (callTimingData.Afternoon / todayCalls.length) * 100 : 0}%` }} 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600">Evening</span>
                    <span className="font-bold text-slate-900">{callTimingData.Evening}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${todayCalls.length > 0 ? (callTimingData.Evening / todayCalls.length) * 100 : 0}%` }} 
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-600 leading-relaxed">
                {todayCalls.length > 0 
                  ? `Most calls are in the ${peakCallTime.toLowerCase()}. Ensure staff is available for follow-ups then.`
                  : 'No calls received today.'
                }
              </p>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">QUICK ACTIONS</h3>
            </div>
            <div className="space-y-2">
              {/* Follow up with most recent action-needed call */}
              {needsAttention.length > 0 && (
                <button className="w-full text-left text-xs text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
                  Follow up with {needsAttention[0].callerName}
                </button>
              )}
              
              {/* Schedule tour manually - always available */}
              <button className="w-full text-left text-xs text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
                Schedule a tour manually
              </button>
              
              {/* Mark tour enrolled - based on actual scheduled tours */}
              {todaysTours.length > 0 && (
                <button className="w-full text-left text-xs text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
                  Mark {todaysTours[0].parentName}'s tour enrolled
                </button>
              )}
              
              {/* Download call report - always available if there are calls today */}
              {todayCalls.length > 0 && (
                <button className="w-full text-left text-xs text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
                  Download today's call report
                </button>
              )}
              
              {/* If no actions available, show message */}
              {needsAttention.length === 0 && todaysTours.length === 0 && todayCalls.length === 0 && (
                <div className="text-xs text-slate-400 px-3 py-2">
                  No actions available today
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
