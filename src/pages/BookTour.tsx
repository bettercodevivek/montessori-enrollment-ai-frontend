import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, CalendarDays, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

interface SchoolInfo {
  schoolName: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  calendarConnected: boolean;
  calendarProvider: string | null;
}

interface Slot {
  start: string;
  end: string;
}

type Step = 'date' | 'form' | 'success';

export const BookTour = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const [info, setInfo] = useState<SchoolInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [childAge, setChildAge] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bookedTime, setBookedTime] = useState('');
  const [calProvider, setCalProvider] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId) return;
    api.get(`/public/book-tour/${schoolId}`)
      .then(res => setInfo(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [schoolId]);

  const today = new Date().toISOString().split('T')[0];

  const loadSlots = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlotsLoading(true);
    try {
      const res = await api.get(`/public/book-tour/${schoolId}/slots?date=${date}`);
      setSlots(Array.isArray(res.data.freeSlots) ? res.data.freeSlots : []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot || !parentName.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post(`/public/book-tour/${schoolId}`, {
        parentName: parentName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        childAge: childAge.trim(),
        reason: reason.trim(),
        scheduledAt: selectedSlot.start,
      });
      setBookedTime(selectedSlot.start);
      setCalProvider(res.data.booking?.calendarProvider || null);
      setStep('success');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Booking failed. Please try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatSlotTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatBookedDate = (iso: string) => {
    return new Date(iso).toLocaleString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="book-tour-page">
        <div className="bt-container"><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--bt-accent)' }} /></div>
      </div>
    );
  }

  if (notFound || !info) {
    return (
      <div className="book-tour-page">
        <div className="bt-container">
          <div className="bt-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: 8 }}>School not found</h2>
            <p style={{ color: 'var(--bt-muted)', fontSize: '0.9rem' }}>This booking link is invalid.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-tour-page">
      <div className="bt-container">
        <div className="bt-header">
          <div className="bt-logo-ring">
            <CalendarDays className="w-6 h-6" style={{ color: '#fff' }} />
          </div>
          <h1 className="bt-title">Book a Tour</h1>
          <p className="bt-subtitle">{info.schoolName} — pick a date and time</p>
        </div>

        <div className="bt-card">

          {step === 'date' && (
            <div className="bt-step">
              <div className="bt-form-group">
                <label className="bt-label">Select a date</label>
                <input
                  type="date"
                  className="bt-input"
                  min={today}
                  value={selectedDate}
                  onChange={e => loadSlots(e.target.value)}
                />
              </div>

              {selectedDate && (
                <div style={{ marginTop: 20 }}>
                  <label className="bt-label">Available times</label>
                  {slotsLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--bt-accent)', margin: '0 auto' }} />
                    </div>
                  ) : slots.length === 0 ? (
                    <p style={{ color: 'var(--bt-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '16px 0' }}>
                      No available times on this date. Try another day.
                    </p>
                  ) : (
                    <div className="bt-slots-grid">
                      {slots.map(slot => (
                        <button
                          key={slot.start}
                          type="button"
                          className={`bt-slot-btn ${selectedSlot?.start === slot.start ? 'selected' : ''}`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {formatSlotTime(slot.start)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedSlot && (
                <button
                  type="button"
                  className="bt-btn-primary"
                  onClick={() => setStep('form')}
                  style={{ marginTop: 24 }}
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {step === 'form' && (
            <div className="bt-step">
              <div className="bt-status-badge">
                <div className="bt-status-dot" />
                <span>
                  {new Date(selectedSlot!.start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
                  at {formatSlotTime(selectedSlot!.start)}
                </span>
              </div>

              {submitError && (
                <div className="bt-toast-inline error">{submitError}</div>
              )}

              <div className="bt-form-group">
                <label className="bt-label">Your name *</label>
                <input type="text" className="bt-input" placeholder="Jane Doe" value={parentName} onChange={e => setParentName(e.target.value)} required />
              </div>
              <div className="bt-row-2">
                <div className="bt-form-group">
                  <label className="bt-label">Email</label>
                  <input type="email" className="bt-input" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="bt-form-group">
                  <label className="bt-label">Phone</label>
                  <input type="tel" className="bt-input" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="bt-row-2">
                <div className="bt-form-group">
                  <label className="bt-label">Child's age</label>
                  <input type="text" className="bt-input" placeholder="e.g. 3 years" value={childAge} onChange={e => setChildAge(e.target.value)} />
                </div>
                <div className="bt-form-group">
                  <label className="bt-label">Reason</label>
                  <input type="text" className="bt-input" placeholder="Enrollment inquiry" value={reason} onChange={e => setReason(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" className="bt-btn-secondary" onClick={() => setStep('date')}>
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  className="bt-btn-primary"
                  disabled={submitting || !parentName.trim()}
                  onClick={handleBook}
                  style={{ flex: 1 }}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
                  {submitting ? 'Booking…' : 'Book Tour'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="bt-step" style={{ textAlign: 'center', padding: '8px 0' }}>
              <div className="bt-success-icon">
                <CheckCircle className="w-7 h-7" style={{ color: 'var(--bt-success)' }} />
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: 10 }}>
                Tour Booked!
              </h2>
              <p style={{ color: 'var(--bt-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Your tour at {info.schoolName} has been scheduled.
              </p>
              <div className="bt-event-summary">
                <div className="bt-summary-row"><strong>Name</strong><span>{parentName}</span></div>
                <div className="bt-summary-row"><strong>When</strong><span>{formatBookedDate(bookedTime)}</span></div>
                {email && <div className="bt-summary-row"><strong>Email</strong><span>{email}</span></div>}
                {phone && <div className="bt-summary-row"><strong>Phone</strong><span>{phone}</span></div>}
                {calProvider && (
                  <div className="bt-summary-row">
                    <strong>Calendar</strong>
                    <span style={{ color: 'var(--bt-success)' }}>Added to {calProvider === 'google' ? 'Google' : 'Outlook'} Calendar</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="bt-btn-secondary"
                onClick={() => {
                  setStep('date');
                  setSelectedDate('');
                  setSelectedSlot(null);
                  setParentName(''); setEmail(''); setPhone(''); setChildAge(''); setReason('');
                  setSubmitError('');
                }}
              >
                Book another tour
              </button>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');

        .book-tour-page {
          --bt-bg: #0d0f14;
          --bt-surface: #161a23;
          --bt-card: #1c2130;
          --bt-border: #2a3047;
          --bt-accent: #4f8ef7;
          --bt-accent2: #6ee7b7;
          --bt-text: #e8ecf4;
          --bt-muted: #7a869a;
          --bt-error: #f87171;
          --bt-success: #34d399;
          font-family: 'DM Sans', sans-serif;
          background: var(--bt-bg);
          color: var(--bt-text);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background-image:
            radial-gradient(ellipse 60% 50% at 20% 20%, rgba(79,142,247,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(110,231,183,0.06) 0%, transparent 70%);
        }
        .bt-container { width: 100%; max-width: 480px; display: flex; flex-direction: column; align-items: center; }
        .bt-header { text-align: center; margin-bottom: 36px; }
        .bt-logo-ring {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, var(--bt-accent), var(--bt-accent2));
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 0 0 8px rgba(79,142,247,0.12);
        }
        .bt-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.85rem; font-weight: 600; letter-spacing: -0.5px;
          background: linear-gradient(135deg, #e8ecf4 40%, var(--bt-accent2));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .bt-subtitle { color: var(--bt-muted); font-size: 0.88rem; margin-top: 6px; font-weight: 300; }
        .bt-card {
          width: 100%;
          background: var(--bt-card); border: 1px solid var(--bt-border);
          border-radius: 14px; padding: 32px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.45);
        }
        .bt-step { animation: btFadeIn 0.3s ease; }
        @keyframes btFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        .bt-label {
          display: block; font-size: 0.8rem; font-weight: 500; color: var(--bt-muted);
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;
        }
        .bt-input {
          width: 100%; background: var(--bt-surface); border: 1px solid var(--bt-border);
          border-radius: 8px; color: var(--bt-text); font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; padding: 12px 14px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .bt-input:focus { border-color: var(--bt-accent); box-shadow: 0 0 0 3px rgba(79,142,247,0.15); }
        .bt-form-group { margin-bottom: 20px; }
        .bt-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .bt-slots-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 8px; max-height: 240px; overflow-y: auto; padding: 4px 0;
        }
        .bt-slot-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          background: var(--bt-surface); border: 1px solid var(--bt-border);
          border-radius: 8px; color: var(--bt-muted); font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem; padding: 10px 8px; cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .bt-slot-btn:hover { border-color: var(--bt-accent); color: var(--bt-accent); }
        .bt-slot-btn.selected {
          background: rgba(79,142,247,0.15); border-color: var(--bt-accent);
          color: var(--bt-accent); font-weight: 500;
        }
        .bt-status-badge {
          display: flex; align-items: center; gap: 10px;
          background: rgba(110,231,183,0.08); border: 1px solid rgba(110,231,183,0.2);
          border-radius: 8px; padding: 10px 14px; font-size: 0.85rem;
          color: var(--bt-accent2); margin-bottom: 24px;
        }
        .bt-status-dot {
          width: 8px; height: 8px; border-radius: 50%; background: var(--bt-accent2);
          flex-shrink: 0; box-shadow: 0 0 6px var(--bt-accent2);
          animation: btPulse 2s infinite;
        }
        @keyframes btPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .bt-btn-primary {
          width: 100%;
          background: linear-gradient(135deg, var(--bt-accent), #3b6fd4);
          color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.95rem;
          font-weight: 500; padding: 13px; border: none; border-radius: 8px;
          cursor: pointer; transition: opacity 0.2s, transform 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .bt-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .bt-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .bt-btn-secondary {
          background: transparent; border: 1px solid var(--bt-border); color: var(--bt-muted);
          font-family: 'DM Sans', sans-serif; font-size: 0.88rem; padding: 10px 20px;
          border-radius: 8px; cursor: pointer; transition: border-color 0.2s, color 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .bt-btn-secondary:hover { border-color: var(--bt-accent); color: var(--bt-accent); }
        .bt-success-icon {
          width: 64px; height: 64px; background: rgba(52,211,153,0.1);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px; border: 1px solid rgba(52,211,153,0.3);
        }
        .bt-event-summary {
          background: var(--bt-surface); border: 1px solid var(--bt-border);
          border-radius: 8px; padding: 14px 16px; margin: 20px 0; text-align: left; font-size: 0.88rem;
        }
        .bt-summary-row { display: flex; gap: 8px; margin-bottom: 6px; color: var(--bt-muted); }
        .bt-summary-row:last-child { margin-bottom: 0; }
        .bt-summary-row strong { color: var(--bt-text); min-width: 80px; }
        .bt-toast-inline {
          padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 16px;
        }
        .bt-toast-inline.error {
          background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.3); color: var(--bt-error);
        }
      `}</style>
    </div>
  );
};
